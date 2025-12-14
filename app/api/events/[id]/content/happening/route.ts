import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminById } from '@/lib/auth'
import { getEventById } from '@/lib/events'
import { supabase } from '@/lib/supabase/client'
import { getPreEventHappening, addPreEventHappening, removePreEventHappening } from '@/lib/eventContent'

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

    const happening = await getPreEventHappening(params.id)

    return NextResponse.json({ happening })
  } catch (error) {
    console.error('Get happening content error:', error)
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
    const { imageUrl, altText, sortOrder } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    const happening = await addPreEventHappening(params.id, imageUrl, {
      altText,
      sortOrder: sortOrder || 0,
    })

    if (!happening) {
      return NextResponse.json(
        { error: 'Failed to add happening content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ happening }, { status: 201 })
  } catch (error) {
    console.error('Add happening content error:', error)
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
    const happeningId = searchParams.get('happeningId')

    if (!happeningId) {
      return NextResponse.json(
        { error: 'Happening ID is required' },
        { status: 400 }
      )
    }

    const success = await removePreEventHappening(happeningId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove happening content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove happening content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}