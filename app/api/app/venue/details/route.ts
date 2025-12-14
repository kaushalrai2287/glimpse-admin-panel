import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const event_id = searchParams.get('event_id')

    // Validate required fields
    if (!user_id || !event_id) {
      return NextResponse.json(
        { error: 'Missing required parameters: user_id and event_id are required' },
        { status: 400 }
      )
    }

    // Validate user_id format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(user_id)) {
      return NextResponse.json(
        { error: 'Invalid user_id format' },
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
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Find event by event_id (UUID) or event_id (string like EVT-...)
    let { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, event_id, venue_id, is_enabled, status')
      .eq('id', event_id)
      .single()

    // If not found by UUID, try by event_id string
    if (eventError || !event) {
      const { data: eventByStringId, error: eventByStringError } = await supabase
        .from('events')
        .select('id, event_id, venue_id, is_enabled, status')
        .eq('event_id', event_id)
        .single()
      
      if (!eventByStringError && eventByStringId) {
        event = eventByStringId
        eventError = null
      }
    }

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
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

    // Check if event has a venue
    if (!event.venue_id) {
      return NextResponse.json(
        { error: 'Event does not have a venue assigned' },
        { status: 404 }
      )
    }

    // Get venue details
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('*')
      .eq('id', event.venue_id)
      .single()

    if (venueError || !venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      )
    }

    // Get facilities
    const { data: facilities, error: facilitiesError } = await supabase
      .from('venue_facilities')
      .select('id, name, image_url')
      .eq('venue_id', venue.id)
      .order('name', { ascending: true })

    // Get SPOC (contacts)
    const { data: contacts, error: contactsError } = await supabase
      .from('venue_contacts')
      .select('id, name, image_url, phone_number, email')
      .eq('venue_id', venue.id)
      .order('name', { ascending: true })

    // Get venue photos
    const { data: photos, error: photosError } = await supabase
      .from('venue_photos')
      .select('id, image_url')
      .eq('venue_id', venue.id)
      .order('sort_order', { ascending: true })

    // Build response
    const response = {
      success: true,
      venue_name: venue.name || null,
      venue_address: venue.address || null,
      venue_description: venue.description || null,
      venue_image_url: venue.bg_image_url || null,
      venue_lat: venue.latitude || null,
      venue_long: venue.longitude || null,
      venue_city: venue.city || null,
      facilities: (facilities || []).map((facility: any) => ({
        facility_name: facility.name || null,
        facility_image: facility.image_url || null,
      })),
      spoc_detail: (contacts || []).map((contact: any) => ({
        spoc_name: contact.name || null,
        image_url: contact.image_url || null,
        contact_no: contact.phone_number || null,
        spoc_email: contact.email || null,
      })),
      venue_photos: (photos || []).map((photo: any) => ({
        image_url: photo.image_url || null,
        image_id: photo.id || null,
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get venue details error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
