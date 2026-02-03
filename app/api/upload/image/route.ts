import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminById } from '@/lib/auth'
import { uploadImage, type ImageCategory } from '@/lib/upload'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const category = formData.get('category') as ImageCategory | null
    const filename = formData.get('filename') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories: ImageCategory[] = [
      'venues/bg',
      'venues/facilities',
      'venues/contacts',
      'venues/photos',
      'events/splash',
      'events/banners',
      'events/explore',
      'events/happening',
      'events/sessions',
      'events/days',
      'profiles',
    ]

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      )
    }

    // Upload image
    const imagePath = await uploadImage(file, category, filename || undefined)

    return NextResponse.json({
      success: true,
      imageUrl: imagePath,
      message: 'Image uploaded successfully',
    })
  } catch (error: any) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}
