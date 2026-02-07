import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminById } from '@/lib/auth'
import { getEventById } from '@/lib/events'
import { supabase } from '@/lib/supabase/client'
import { getEventIntro, addEventIntro, removeEventIntro } from '@/lib/eventContent'

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

    const intro = await getEventIntro(params.id)

    return NextResponse.json({ intro })
  } catch (error) {
    console.error('Get intro content error:', error)
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
    const { title, description, imageUrl, sortOrder } = body

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'Title and image URL are required' },
        { status: 400 }
      )
    }

    const intro = await addEventIntro(params.id, title, imageUrl, {
      description,
      sortOrder: sortOrder || 0,
    })

    if (!intro) {
      return NextResponse.json(
        { error: 'Failed to add intro content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ intro }, { status: 201 })
  } catch (error) {
    console.error('Add intro content error:', error)
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
    const introId = searchParams.get('introId')

    if (!introId) {
      return NextResponse.json(
        { error: 'Intro ID is required' },
        { status: 400 }
      )
    }

    const success = await removeEventIntro(introId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove intro content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove intro content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
