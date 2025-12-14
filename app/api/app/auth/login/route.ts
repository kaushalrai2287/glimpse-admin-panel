import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// Generate 4-digit OTP
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { country_code, username, phone_no, event_code } = body

    // Validate required fields
    if (!country_code || !phone_no || !event_code) {
      return NextResponse.json(
        { error: 'Missing required fields: country_code, phone_no, and event_code are required' },
        { status: 400 }
      )
    }

    // Validate phone number format
    if (!/^\d+$/.test(phone_no)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Find event by login_code or event_id
    let eventQuery = supabase
      .from('events')
      .select('id, name, login_code, is_enabled, status')
    
    // Try login_code first, then event_id if not found
    let { data: event, error: eventError } = await eventQuery
      .eq('login_code', event_code)
      .single()

    // If not found by login_code, try event_id
    if (eventError || !event) {
      const { data: eventById, error: eventByIdError } = await supabase
        .from('events')
        .select('id, name, login_code, is_enabled, status')
        .eq('event_id', event_code)
        .single()
      
      if (!eventByIdError && eventById) {
        event = eventById
        eventError = null
      }
    }

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Invalid event code' },
        { status: 404 }
      )
    }

    // Check if event is enabled
    if (!event.is_enabled) {
      return NextResponse.json(
        { error: 'Event is currently disabled' },
        { status: 403 }
      )
    }

    // Check if event status is active
    if (event.status !== 'active') {
      return NextResponse.json(
        { error: 'Event is not active' },
        { status: 403 }
      )
    }

    // Generate 4-digit OTP
    const otp = generateOTP()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10) // OTP expires in 10 minutes

    // Delete any existing OTPs for this phone number and event
    await supabase
      .from('app_otps')
      .delete()
      .eq('event_id', event.id)
      .eq('country_code', country_code)
      .eq('phone_number', phone_no)

    // Insert new OTP
    const { error: otpError } = await supabase
      .from('app_otps')
      .insert({
        event_id: event.id,
        country_code,
        phone_number: phone_no,
        username: username || null,
        otp,
        expires_at: expiresAt.toISOString(),
        is_verified: false,
      })

    if (otpError) {
      console.error('OTP creation error:', otpError)
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      )
    }

    // Return OTP (in production, you might want to send this via SMS instead)
    return NextResponse.json({
      success: true,
      otp: otp,
      message: 'OTP generated successfully',
      expires_in: 600, // 10 minutes in seconds
    })
  } catch (error) {
    console.error('App login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
