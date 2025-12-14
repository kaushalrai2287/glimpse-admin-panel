import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminById } from '@/lib/auth'
import { getEventById } from '@/lib/events'
import { supabase } from '@/lib/supabase/client'
import { getPreEventExplore, addPreEventExplore, removePreEventExplore } from '@/lib/eventContent'

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

    const explore = await getPreEventExplore(params.id)

    return NextResponse.json({ explore })
  } catch (error) {
    console.error('Get explore content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const body = await request.json()
    const { name, imageUrl, sortOrder } = body

    if (!name || !imageUrl) {
      return NextResponse.json(
        { error: 'Name and image URL are required' },
        { status: 400 }
      )
    }

    const explore = await addPreEventExplore(params.id, name, imageUrl, sortOrder || 0)

    if (!explore) {
      return NextResponse.json(
        { error: 'Failed to add explore content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ explore }, { status: 201 })
  } catch (error) {
    console.error('Add explore content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(request.url)
    const exploreId = searchParams.get('exploreId')

    if (!exploreId) {
      return NextResponse.json(
        { error: 'Explore ID is required' },
        { status: 400 }
      )
    }

    const success = await removePreEventExplore(exploreId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove explore content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove explore content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}