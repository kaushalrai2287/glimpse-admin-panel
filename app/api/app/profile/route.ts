import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: user_id is required' },
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
    const { data: user, error: userError } = await supabase
      .from('app_users')
      .select('id')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get profile settings (there should be only one record, or we get the first one)
    const { data: profileSettings, error: profileError } = await supabase
      .from('app_profile_settings')
      .select('*')
      .limit(1)
      .single()

    // If no profile settings exist, return defaults
    if (profileError || !profileSettings) {
      return NextResponse.json({
        success: true,
        user_image_url: null,
        about_us_url: null,
        privacy_policy_url: null,
        terms_and_condition_url: null,
        app_version_detail: {
          version: '1.0.0',
          detail: 'Initial version'
        },
        insta_id: null,
      })
    }

    // Build response
    const response = {
      success: true,
      user_image_url: profileSettings.user_image_url || null,
      about_us_url: profileSettings.about_us_url || null,
      privacy_policy_url: profileSettings.privacy_policy_url || null,
      terms_and_condition_url: profileSettings.terms_and_condition_url || null,
      app_version_detail: {
        version: profileSettings.app_version || '1.0.0',
        detail: profileSettings.app_version_detail || 'No details available'
      },
      insta_id: profileSettings.insta_id || null,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
