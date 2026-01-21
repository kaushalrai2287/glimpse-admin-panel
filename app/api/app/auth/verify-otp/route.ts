import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { country_code, username, phone_no, event_code, otp, fcm_token, platform } = body

    // Validate required fields
    if (!country_code || !phone_no || !event_code || !otp) {
      return NextResponse.json(
        { 
          status: 0,
          message: 'Missing required fields: country_code, phone_no, event_code, and otp are required',
          data: {}
        },
        { status: 400 }
      )
    }

    // Validate phone number format
    if (!/^\d+$/.test(phone_no)) {
      return NextResponse.json(
        { 
          status: 0,
          message: 'Invalid phone number format',
          data: {}
        },
        { status: 400 }
      )
    }

    // Validate OTP format (4 digits)
    if (!/^\d{4}$/.test(otp)) {
      return NextResponse.json(
        { 
          status: 0,
          message: 'Invalid OTP format. OTP must be 4 digits',
          data: {}
        },
        { status: 400 }
      )
    }

    // Find event by login_code or event_id
    let { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, event_id, login_code, name, primary_color, secondary_color, is_enabled, status')
      .eq('login_code', event_code)
      .single()

    // If not found by login_code, try event_id
    if (eventError || !event) {
      const { data: eventById, error: eventByIdError } = await supabase
        .from('events')
        .select('id, event_id, login_code, name, primary_color, secondary_color, is_enabled, status')
        .eq('event_id', event_code)
        .single()
      
      if (!eventByIdError && eventById) {
        event = eventById
        eventError = null
      }
    }

    if (eventError || !event) {
      return NextResponse.json(
        { 
          status: 0,
          message: 'Invalid event code',
          data: {}
        },
        { status: 404 }
      )
    }

    // Check if event is enabled
    if (!event.is_enabled) {
      return NextResponse.json(
        { 
          status: 0,
          message: 'Event is currently disabled',
          data: {}
        },
        { status: 403 }
      )
    }

    // Check if event status is active
    if (event.status !== 'active') {
      return NextResponse.json(
        { 
          status: 0,
          message: 'Event is not active',
          data: {}
        },
        { status: 403 }
      )
    }

    // Verify OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('app_otps')
      .select('*')
      .eq('event_id', event.id)
      .eq('country_code', country_code)
      .eq('phone_number', phone_no)
      .eq('otp', otp)
      .eq('is_verified', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { 
          status: 0,
          message: 'Invalid or expired OTP',
          data: {}
        },
        { status: 401 }
      )
    }

    // Mark OTP as verified
    await supabase
      .from('app_otps')
      .update({ is_verified: true })
      .eq('id', otpRecord.id)

    // Get or create user
    let { data: user, error: userError } = await supabase
      .from('app_users')
      .select('*')
      .eq('event_id', event.id)
      .eq('country_code', country_code)
      .eq('phone_number', phone_no)
      .single()

    if (userError || !user) {
      // Create new user
      const { data: newUser, error: createUserError } = await supabase
        .from('app_users')
        .insert({
          event_id: event.id,
          country_code,
          phone_number: phone_no,
          username: username || null,
        })
        .select()
        .single()

      if (createUserError || !newUser) {
        console.error('Create user error:', createUserError)
        return NextResponse.json(
          { 
            status: 0,
            message: 'Failed to create user',
            data: {}
          },
          { status: 500 }
        )
      }
      user = newUser
    } else {
      // Update existing user if username is provided
      if (username && username !== user.username) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('app_users')
          .update({ username })
          .eq('id', user.id)
          .select()
          .single()

        if (!updateError && updatedUser) {
          user = updatedUser
        }
      }
    }

    // Handle device registration
    let device = null
    if (fcm_token && platform) {
      // Determine device_type from platform
      let device_type = 'web'
      if (platform.toLowerCase().includes('android')) {
        device_type = 'android'
      } else if (platform.toLowerCase().includes('ios') || platform.toLowerCase().includes('iphone') || platform.toLowerCase().includes('ipad')) {
        device_type = 'ios'
      }

      // Check if device already exists
      const { data: existingDevice, error: deviceError } = await supabase
        .from('app_devices')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_id', event.id)
        .eq('fcm_token', fcm_token)
        .single()

      if (deviceError || !existingDevice) {
        // Create new device
        const { data: newDevice, error: createDeviceError } = await supabase
          .from('app_devices')
          .insert({
            user_id: user.id,
            event_id: event.id,
            device_type,
            fcm_token,
            platform,
            app_version: body.app_version || null,
            device_version: body.device_version || null,
          })
          .select()
          .single()

        if (!createDeviceError && newDevice) {
          device = newDevice
        }
      } else {
        // Update existing device
        const { data: updatedDevice, error: updateDeviceError } = await supabase
          .from('app_devices')
          .update({
            platform,
            app_version: body.app_version || existingDevice.app_version,
            device_version: body.device_version || existingDevice.device_version,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDevice.id)
          .select()
          .single()

        if (!updateDeviceError && updatedDevice) {
          device = updatedDevice
        } else {
          device = existingDevice
        }
      }
    }

    // Build response
    const responseData: any = {
      user: {
        user_id: user.id,
        name: user.username || '',
        otp_phone_no: `${country_code}${phone_no}`,
      },
      event: {
        event_id: event.event_id,
        event_login_code: event.login_code,
        primary_color: event.primary_color || '#5550B7',
        secondary_color: event.secondary_color || '#FFFFFF',
        app_version: body.app_version || '1.0.0', // Default or from request
        forceful_update: false, // You can add this field to events table later
      },
    }

    if (device) {
      responseData.device = {
        id: device.id,
        device_id: device.id, // Same as id
        device_type: device.device_type,
        token: device.fcm_token,
        version: device.device_version || device.app_version || '1.0.0',
      }
    }

    return NextResponse.json({
      status: 1,
      message: 'OTP verified successfully',
      data: responseData
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { 
        status: 0,
        message: 'Internal server error',
        data: {}
      },
      { status: 500 }
    )
  }
}
