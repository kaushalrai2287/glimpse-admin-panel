import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminById } from '@/lib/auth'
import { getAllEvents, getEventsByAdminId, createEvent } from '@/lib/events'

export async function GET(request: NextRequest) {
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

    const isSuperAdmin = admin.role === 'super_admin'
    const events = await getEventsByAdminId(adminId, isSuperAdmin)

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    if (admin.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can create events' },
        { status: 403 }
      )
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
      assignedAdmins,
      // Event styling
      splashImageUrl,
      primaryColor,
      secondaryColor,
      // Pre-event content
      backgroundBannerImageUrl,
      bannerTextColor,
      welcomeText,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      )
    }

    const event = await createEvent(
      name,
      description || '',
      adminId,
      startDate,
      endDate,
      loginCode
    )

    if (!event) {
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      )
    }

    // Update event with additional details
    const updates: any = {}
    if (categoryId) updates.category_id = categoryId
    if (venueId) updates.venue_id = venueId
    if (splashImageUrl) updates.splash_image_url = splashImageUrl
    if (primaryColor) updates.primary_color = primaryColor
    if (secondaryColor) updates.secondary_color = secondaryColor
    if (backgroundBannerImageUrl) updates.background_banner_image_url = backgroundBannerImageUrl
    if (bannerTextColor) updates.banner_text_color = bannerTextColor
    if (welcomeText) updates.welcome_text = welcomeText

    // During event content
    if (body.duringBackgroundBannerImageUrl) updates.during_background_banner_image_url = body.duringBackgroundBannerImageUrl
    if (body.duringBannerTextColor) updates.during_banner_text_color = body.duringBannerTextColor
    if (body.duringWelcomeText) updates.during_welcome_text = body.duringWelcomeText

    // Post event content
    if (body.postBackgroundBannerImageUrl) updates.post_background_banner_image_url = body.postBackgroundBannerImageUrl
    if (body.postBannerTextColor) updates.post_banner_text_color = body.postBannerTextColor
    if (body.postWelcomeText) updates.post_welcome_text = body.postWelcomeText

    if (Object.keys(updates).length > 0) {
      const { updateEvent } = await import('@/lib/events')
      await updateEvent(event.id, updates)
    }

    // Assign admins to event if provided
    if (assignedAdmins && Array.isArray(assignedAdmins)) {
      const { assignAdminToEvent } = await import('@/lib/events')
      for (const adminIdToAssign of assignedAdmins) {
        await assignAdminToEvent(adminIdToAssign, event.id)
      }
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

