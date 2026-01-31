import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

/** Extract user_id and event_id from query, body (JSON), or headers. */
async function getParamsFromRequest(request: NextRequest): Promise<{ user_id: string | null; event_id: string | null }> {
  const { searchParams } = new URL(request.url)
  let user_id = searchParams.get('user_id') ?? searchParams.get('userId')
  let event_id = searchParams.get('event_id') ?? searchParams.get('eventId')

  if (!user_id || !event_id) {
    try {
      const body = await request.json() as Record<string, unknown> | null
      if (body && typeof body === 'object') {
        const data = (body.data as Record<string, unknown>) ?? body
        const u = data?.user_id ?? data?.userId ?? body?.user_id ?? body?.userId
        const e = data?.event_id ?? data?.eventId ?? body?.event_id ?? body?.eventId
        user_id = user_id ?? (u != null ? String(u) : null)
        event_id = event_id ?? (e != null ? String(e) : null)
      }
    } catch {
      // ignore no/invalid body
    }
  }

  user_id = user_id ?? request.headers.get('x-user-id')
  event_id = event_id ?? request.headers.get('x-event-id')

  return { user_id, event_id }
}

export async function GET(request: NextRequest) {
  try {
    const { user_id, event_id } = await getParamsFromRequest(request)

    if (!user_id || !event_id) {
      return NextResponse.json(
        { error: 'Missing required parameters: user_id and event_id are required (query, body, or headers X-User-Id, X-Event-Id)' },
        { status: 400 }
      )
    }

    return await fetchVenueDetails(user_id, event_id)
  } catch (error) {
    console.error('Get venue details error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/** POST: same as GET; use when sending JSON body (query, body, or headers). */
export async function POST(request: NextRequest) {
  try {
    const { user_id, event_id } = await getParamsFromRequest(request)

    if (!user_id || !event_id) {
      return NextResponse.json(
        { error: 'Missing required parameters: user_id and event_id are required (query, body, or headers X-User-Id, X-Event-Id)' },
        { status: 400 }
      )
    }

    return await fetchVenueDetails(user_id, event_id)
  } catch (error) {
    console.error('Get venue details error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function fetchVenueDetails(user_id: string, event_id: string): Promise<NextResponse> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(user_id)) {
    return NextResponse.json(
      { error: 'Invalid user_id format' },
      { status: 400 }
    )
  }

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

  let { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, event_id, venue_id, is_enabled, status')
    .eq('id', event_id)
    .single()

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

  if (!event.is_enabled) {
    return NextResponse.json(
      { error: 'Event is currently disabled' },
      { status: 403 }
    )
  }

  if (event.status !== 'active') {
    return NextResponse.json(
      { error: 'Event is not active' },
      { status: 403 }
    )
  }

  if (!event.venue_id) {
    return NextResponse.json(
      { error: 'Event does not have a venue assigned' },
      { status: 404 }
    )
  }

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

  const { data: facilities } = await supabase
    .from('venue_facilities')
    .select('id, name, image_url')
    .eq('venue_id', venue.id)
    .order('name', { ascending: true })

  const { data: contacts } = await supabase
    .from('venue_contacts')
    .select('id, name, image_url, phone_number, email')
    .eq('venue_id', venue.id)
    .order('name', { ascending: true })

  const { data: photos } = await supabase
    .from('venue_photos')
    .select('id, image_url')
    .eq('venue_id', venue.id)
    .order('sort_order', { ascending: true })

  return NextResponse.json({
    success: true,
    venue_name: venue.name || null,
    venue_address: venue.address || null,
    venue_description: venue.description || null,
    venue_image_url: venue.bg_image_url || null,
    venue_lat: venue.latitude || null,
    venue_long: venue.longitude || null,
    venue_city: venue.city || null,
    facilities: (facilities || []).map((facility: { name: string; image_url: string | null }) => ({
      facility_name: facility.name || null,
      facility_image: facility.image_url || null,
    })),
    spoc_detail: (contacts || []).map((contact: { name: string; image_url: string | null; phone_number: string | null; email: string | null }) => ({
      spoc_name: contact.name || null,
      image_url: contact.image_url || null,
      contact_no: contact.phone_number || null,
      spoc_email: contact.email || null,
    })),
    venue_photos: (photos || []).map((photo: { id: string; image_url: string | null }) => ({
      image_url: photo.image_url || null,
      image_id: photo.id || null,
    })),
  })
}
