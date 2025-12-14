import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminById } from '@/lib/auth'
import { addVenueContact, removeVenueContact } from '@/lib/venues'

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
        { error: 'Only super admins can add venue contacts' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, imageUrl, phoneNumber, email } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Contact name is required' },
        { status: 400 }
      )
    }

    const contact = await addVenueContact(params.id, name, {
      imageUrl,
      phoneNumber,
      email,
    })

    if (!contact) {
      return NextResponse.json(
        { error: 'Failed to add contact' },
        { status: 500 }
      )
    }

    return NextResponse.json({ contact }, { status: 201 })
  } catch (error) {
    console.error('Add contact error:', error)
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
        { error: 'Only super admins can remove venue contacts' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contactId')

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      )
    }

    const success = await removeVenueContact(contactId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove contact' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove contact error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}