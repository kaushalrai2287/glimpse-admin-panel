import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminById } from '@/lib/auth'
import { getEventById, getEventWithAssignedAdmins, updateEvent } from '@/lib/events'
import { supabase } from '@/lib/supabase/client'

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

    const event = await getEventWithAssignedAdmins(params.id)

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if admin has access to this event
    if (admin.role !== 'super_admin') {
      // Check if event is enabled - only super admins can see disabled events
      if (!event.is_enabled) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }

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

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Get event error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    // Check permissions
    if (admin.role !== 'super_admin') {
      // Regular admins can only edit enabled events they're assigned to
      if (!event.is_enabled) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }

      // Check if admin is assigned to this event
      const { data: adminEvent, error: accessError } = await supabase
        .from('admin_events')
        .select('id')
        .eq('admin_id', adminId)
        .eq('event_id', params.id)
        .single()

      if (accessError || !adminEvent) {
        return NextResponse.json(
          { error: 'You do not have permission to edit this event' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const {
      name,
      description,
      categoryId,
      venueId,
      startDate,
      endDate,
      loginCode,
      status,
      splashImageUrl,
      primaryColor,
      secondaryColor,
      backgroundBannerImageUrl,
      bannerTextColor,
      welcomeText,
    } = body

    // Build updates object
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (categoryId !== undefined) updates.category_id = categoryId
    if (venueId !== undefined) updates.venue_id = venueId
    if (startDate !== undefined) updates.start_date = startDate
    if (endDate !== undefined) updates.end_date = endDate
    if (loginCode !== undefined) updates.login_code = loginCode
    if (status !== undefined) updates.status = status
    if (splashImageUrl !== undefined) updates.splash_image_url = splashImageUrl
    if (primaryColor !== undefined) updates.primary_color = primaryColor
    if (secondaryColor !== undefined) updates.secondary_color = secondaryColor
    if (backgroundBannerImageUrl !== undefined) updates.background_banner_image_url = backgroundBannerImageUrl
    if (bannerTextColor !== undefined) updates.banner_text_color = bannerTextColor
    if (welcomeText !== undefined) updates.welcome_text = welcomeText

    // During event content
    if (body.duringBackgroundBannerImageUrl !== undefined) updates.during_background_banner_image_url = body.duringBackgroundBannerImageUrl
    if (body.duringBannerTextColor !== undefined) updates.during_banner_text_color = body.duringBannerTextColor
    if (body.duringWelcomeText !== undefined) updates.during_welcome_text = body.duringWelcomeText

    // Post event content
    if (body.postBackgroundBannerImageUrl !== undefined) updates.post_background_banner_image_url = body.postBackgroundBannerImageUrl
    if (body.postBannerTextColor !== undefined) updates.post_banner_text_color = body.postBannerTextColor
    if (body.postWelcomeText !== undefined) updates.post_welcome_text = body.postWelcomeText

    const updatedEvent = await updateEvent(params.id, updates)

    if (!updatedEvent) {
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ event: updatedEvent })
  } catch (error) {
    console.error('Update event error:', error)
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

    // Only super admins can delete events
    if (admin.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can delete events' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Delete event error:', error)
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
