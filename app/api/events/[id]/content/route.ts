import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminById } from '@/lib/auth'
import { getEventById } from '@/lib/events'
import { supabase } from '@/lib/supabase/client'
import {
  getPreEventExplore,
  addPreEventExplore,
  removePreEventExplore,
  getPreEventHappening,
  addPreEventHappening,
  removePreEventHappening
} from '@/lib/eventContent'

// GET: Get all content for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const adminId = cookieStore.get('admin_id')?.value

    if (!adminId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const admin = await getAdminById(adminId)
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      )
    }

    const event = await getEventById(params.id)
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if admin has access to this event
    if (admin.role !== 'super_admin') {
      const { data: adminEvent, error: accessError } = await supabase
        .from('admin_events')
        .select('id')
        .eq('admin_id', adminId)
        .eq('event_id', params.id)
        .single()

      if (accessError || !adminEvent) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    const [explore, happening] = await Promise.all([
      getPreEventExplore(params.id),
      getPreEventHappening(params.id),
    ])

    return NextResponse.json({
      content: {
        pre_event_explore: explore,
        pre_event_happening: happening,
      }
    })
  } catch (error) {
    console.error('Get event content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}