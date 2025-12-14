import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminById } from '@/lib/auth'
import { addVenueFacility, removeVenueFacility } from '@/lib/venues'

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

    if (admin.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can add venue facilities' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, imageUrl } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Facility name is required' },
        { status: 400 }
      )
    }

    const facility = await addVenueFacility(params.id, name, imageUrl)

    if (!facility) {
      return NextResponse.json(
        { error: 'Failed to add facility' },
        { status: 500 }
      )
    }

    return NextResponse.json({ facility }, { status: 201 })
  } catch (error) {
    console.error('Add facility error:', error)
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

    if (admin.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can remove venue facilities' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const facilityId = searchParams.get('facilityId')

    if (!facilityId) {
      return NextResponse.json(
        { error: 'Facility ID is required' },
        { status: 400 }
      )
    }

    const success = await removeVenueFacility(facilityId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove facility' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove facility error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}