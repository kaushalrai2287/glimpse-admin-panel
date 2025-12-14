import { supabase } from './supabase/client'
import type { Event, Admin, EventWithAssignedAdmins } from './types'

export function generateEventId(): string {
  return `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
}

export function generateLoginCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export async function createEvent(
  name: string,
  description: string,
  createdBy: string,
  startDate?: string,
  endDate?: string,
  loginCode?: string
): Promise<Event | null> {
  try {
    const eventId = generateEventId()
    const code = loginCode || generateLoginCode()

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        event_id: eventId,
        name,
        description,
        login_code: code,
        created_by: createdBy,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        is_enabled: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Create event error:', error)
      return null
    }

    return event as Event
  } catch (error) {
    console.error('Create event error:', error)
    return null
  }
}

export async function getAllEvents(includeDisabled = false): Promise<Event[]> {
  try {
    let query = supabase
      .from('events')
      .select('*')

    // Only super admins can see disabled events
    if (!includeDisabled) {
      query = query.eq('is_enabled', true)
    }

    const { data: events, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Get events error:', error)
      return []
    }

    return events as Event[]
  } catch (error) {
    console.error('Get events error:', error)
    return []
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !event) {
      return null
    }

    return event as Event
  } catch (error) {
    console.error('Get event error:', error)
    return null
  }
}

export async function getEventsByAdminId(adminId: string, isSuperAdmin: boolean): Promise<Event[]> {
  try {
    if (isSuperAdmin) {
      // Super admins see all events including disabled ones
      return getAllEvents(true)
    }

    const { data: adminEvents, error } = await supabase
      .from('admin_events')
      .select('event_id')
      .eq('admin_id', adminId)

    if (error) {
      console.error('Get admin events error:', error)
      return []
    }

    const eventIds = adminEvents.map(ae => ae.event_id)

    if (eventIds.length === 0) {
      return []
    }

    // Regular admins only see enabled events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds)
      .eq('is_enabled', true)
      .order('created_at', { ascending: false })

    if (eventsError) {
      console.error('Get events error:', error)
      return []
    }

    return events as Event[]
  } catch (error) {
    console.error('Get events by admin error:', error)
    return []
  }
}

export async function assignAdminToEvent(adminId: string, eventId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('admin_events')
      .insert({
        admin_id: adminId,
        event_id: eventId,
      })

    if (error) {
      console.error('Assign admin to event error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Assign admin to event error:', error)
    return false
  }
}

export async function removeAdminFromEvent(adminId: string, eventId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('admin_events')
      .delete()
      .eq('admin_id', adminId)
      .eq('event_id', eventId)

    if (error) {
      console.error('Remove admin from event error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Remove admin from event error:', error)
    return false
  }
}

export async function getEventWithAssignedAdmins(eventId: string): Promise<EventWithAssignedAdmins | null> {
  try {
    const event = await getEventById(eventId)
    if (!event) {
      return null
    }

    const { data: adminEvents, error } = await supabase
      .from('admin_events')
      .select('admin_id')
      .eq('event_id', eventId)

    if (error) {
      console.error('Get admin events error:', error)
      return { ...event, assigned_admins: [] }
    }

    const adminIds = adminEvents.map(ae => ae.admin_id)

    if (adminIds.length === 0) {
      return { ...event, assigned_admins: [] }
    }

    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('id, email, name, role, created_at, updated_at')
      .in('id', adminIds)

    if (adminsError) {
      console.error('Get admins error:', adminsError)
      return { ...event, assigned_admins: [] }
    }

    // Fetch related content
    const [
      { data: explore },
      { data: happening },
      { data: sessions },
      { data: days }
    ] = await Promise.all([
      supabase.from('pre_event_explore').select('*').eq('event_id', eventId).order('sort_order'),
      supabase.from('pre_event_happening').select('*').eq('event_id', eventId).order('sort_order'),
      supabase.from('event_sessions').select('*').eq('event_id', eventId).order('sort_order'),
      supabase.from('event_days').select('*').eq('event_id', eventId).order('sort_order')
    ])

    return {
      ...event,
      assigned_admins: admins as Admin[],
      pre_event_explore: explore || [],
      pre_event_happening: happening || [],
      event_sessions: sessions || [],
      event_days: days || [],
    }
  } catch (error) {
    console.error('Get event with admins error:', error)
    return null
  }
}

export async function updateEvent(
  eventId: string,
  updates: Partial<Event>
): Promise<Event | null> {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      console.error('Update event error:', error)
      return null
    }

    return event as Event
  } catch (error) {
    console.error('Update event error:', error)
    return null
  }
}

