import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// Helper endpoint to get login_code from event_id
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id } = body

    if (!event_id) {
      return NextResponse.json(
        { error: 'event_id is required' },
        { status: 400 }
      )
    }

    // Find event by event_id
    const { data: event, error } = await supabase
      .from('events')
      .select('event_id, login_code, name, is_enabled, status')
      .eq('event_id', event_id)
      .single()

    if (error || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      event_id: event.event_id,
      login_code: event.login_code,
      name: event.name,
      is_enabled: event.is_enabled,
      status: event.status,
    })
  } catch (error) {
    console.error('Get login code error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
