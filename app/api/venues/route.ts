import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminById } from '@/lib/auth'
import { getAllVenues, createVenue } from '@/lib/venues'

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

    const venues = await getAllVenues()

    return NextResponse.json({ venues })
  } catch (error) {
    console.error('Get venues error:', error)
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

    // All admins can create venues

    const body = await request.json()
    const { name, address, description, bgImageUrl, latitude, longitude, city } = body

    if (!name || !address) {
      return NextResponse.json(
        { error: 'Venue name and address are required' },
        { status: 400 }
      )
    }

    const venue = await createVenue(name, address, {
      description,
      bgImageUrl,
      latitude,
      longitude,
      city,
    })

    if (!venue) {
      return NextResponse.json(
        { error: 'Failed to create venue' },
        { status: 500 }
      )
    }

    return NextResponse.json({ venue }, { status: 201 })
  } catch (error) {
    console.error('Create venue error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}