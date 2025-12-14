import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')?.trim() || ''
    const platform = searchParams.get('platform')
    const fcm_token = searchParams.get('fcm_token')
    const event_id = searchParams.get('event_id')

    // Validate required fields
    if (!event_id) {
      return NextResponse.json(
        {
          message: 'Missing required parameter: event_id is required',
          status: 0,
        },
        { status: 400 }
      )
    }

    // If user_id is provided (not blank), validate format and existence
    if (user_id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(user_id)) {
        return NextResponse.json(
          {
            message: 'Invalid user_id format',
            status: 0,
          },
          { status: 400 }
        )
      }

      // Verify user exists
      const { data: user, error: userError } = await supabase
        .from('app_users')
        .select('id')
        .eq('id', user_id)
        .single()

      if (userError || !user) {
        return NextResponse.json(
          {
            message: 'User not found',
            status: 0,
          },
          { status: 404 }
        )
      }
    }

    // Find event by event_id (UUID) or event_id (string like EVT-...)
    let { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, event_id, primary_color, secondary_color, splash_image_url, is_enabled, status')
      .eq('id', event_id)
      .single()

    // If not found by UUID, try by event_id string
    if (eventError || !event) {
      const { data: eventByStringId, error: eventByStringError } = await supabase
        .from('events')
        .select('id, event_id, primary_color, secondary_color, splash_image_url, is_enabled, status')
        .eq('event_id', event_id)
        .single()

      if (!eventByStringError && eventByStringId) {
        event = eventByStringId
        eventError = null
      }
    }

    if (eventError || !event) {
      return NextResponse.json(
        {
          message: 'Event not found',
          status: 0,
        },
        { status: 404 }
      )
    }

    // Check if event is enabled
    if (!event.is_enabled) {
      return NextResponse.json(
        {
          message: 'Event is currently disabled',
          status: 0,
        },
        { status: 403 }
      )
    }

    // If user_id and fcm_token/platform are provided, update device info
    if (user_id && fcm_token && platform) {
      // Determine device_type from platform
      let device_type = 'web'
      if (platform.toLowerCase().includes('android')) {
        device_type = 'android'
      } else if (platform.toLowerCase().includes('ios') || platform.toLowerCase().includes('iphone') || platform.toLowerCase().includes('ipad')) {
        device_type = 'ios'
      }

      // Check if device already exists
      const { data: existingDevice } = await supabase
        .from('app_devices')
        .select('*')
        .eq('user_id', user_id)
        .eq('event_id', event.id)
        .eq('fcm_token', fcm_token)
        .single()

      if (existingDevice) {
        // Update existing device
        await supabase
          .from('app_devices')
          .update({
            platform,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDevice.id)
      } else {
        // Create new device
        await supabase
          .from('app_devices')
          .insert({
            user_id,
            event_id: event.id,
            device_type,
            fcm_token,
            platform,
          })
      }
    }

    // Get app version from profile settings (default to '1.0.0')
    const { data: profileSettings } = await supabase
      .from('app_profile_settings')
      .select('app_version')
      .limit(1)
      .single()

    const app_version = profileSettings?.app_version || '1.0.0'

    // Build response
    const response = {
      message: 'App info retrieved successfully',
      status: 1,
      data: {
        theme: 'default', // You can add a theme field to events table later if needed
        primary_color: event.primary_color || '#5550B7',
        secondary_color: event.secondary_color || '#FFFFFF',
        app_version: app_version,
        force_full_update: false, // You can add this field to events table later if needed
        splash_image_url: event.splash_image_url || null,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get app info error:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        status: 0,
      },
      { status: 500 }
    )
  }
}
