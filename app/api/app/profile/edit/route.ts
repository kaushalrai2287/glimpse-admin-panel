import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, profile_image_url, insta_id, username } = body

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id is required' },
        { status: 400 }
      )
    }

    // Validate user_id format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(user_id)) {
      return NextResponse.json(
        { error: 'Invalid user_id format' },
        { status: 400 }
      )
    }

    // Verify user exists
    const { data: existingUser, error: userError } = await supabase
      .from('app_users')
      .select('id')
      .eq('id', user_id)
      .single()

    if (userError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Build update object (only include fields that are provided)
    const updateData: any = {}
    if (username !== undefined) updateData.username = username
    if (profile_image_url !== undefined) updateData.profile_image_url = profile_image_url
    if (insta_id !== undefined) updateData.insta_id = insta_id

    // If no fields to update, get current profile data
    if (Object.keys(updateData).length === 0) {
      const { data: currentUser } = await supabase
        .from('app_users')
        .select('username, profile_image_url, insta_id')
        .eq('id', user_id)
        .single()
      
      return NextResponse.json({
        success: true,
        profile_image_url: currentUser?.profile_image_url || null,
        insta_id: currentUser?.insta_id || null,
        username: currentUser?.username || null,
      })
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('app_users')
      .update(updateData)
      .eq('id', user_id)
      .select('username, profile_image_url, insta_id')
      .single()

    if (updateError || !updatedUser) {
      console.error('Update profile error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Build response
    const response = {
      success: true,
      profile_image_url: updatedUser.profile_image_url || null,
      insta_id: updatedUser.insta_id || null,
      username: updatedUser.username || null,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Edit profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
