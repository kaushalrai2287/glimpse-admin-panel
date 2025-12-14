import { NextRequest, NextResponse } from 'next/server'
import { createAdmin, getAllAdmins } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    // Check if any admins exist
    const existingAdmins = await getAllAdmins()

    // If admins exist, require authentication (prevent unauthorized access)
    if (existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'Super admin already exists. Please login to create additional admins.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, password, name, role } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single()

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'An admin with this email already exists' },
        { status: 400 }
      )
    }

    // Create super admin (only allow super_admin role on first setup)
    const admin = await createAdmin(email, password, name, 'super_admin')

    if (!admin) {
      return NextResponse.json(
        { error: 'Failed to create super admin' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create super admin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Check if setup is needed (if no admins exist)
export async function GET() {
  try {
    const admins = await getAllAdmins()
    return NextResponse.json({
      setupNeeded: admins.length === 0,
      adminCount: admins.length,
    })
  } catch (error) {
    console.error('Check setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

