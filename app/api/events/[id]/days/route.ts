import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminById } from '@/lib/auth'
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

        const { data: days, error } = await supabase
            .from('event_days')
            .select('*')
            .eq('event_id', params.id)
            .order('sort_order', { ascending: true })

        if (error) {
            console.error('Get days error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch days' },
                { status: 500 }
            )
        }

        return NextResponse.json({ days })
    } catch (error) {
        console.error('Get days error:', error)
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

        // Check permissions
        if (admin.role !== 'super_admin') {
            const { data: adminEvent } = await supabase
                .from('admin_events')
                .select('id')
                .eq('admin_id', adminId)
                .eq('event_id', params.id)
                .single()

            if (!adminEvent) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                )
            }
        }

        const body = await request.json()
        const {
            date,
            imageUrl,
            description,
            sortOrder
        } = body

        if (!date) {
            return NextResponse.json(
                { error: 'Date is required' },
                { status: 400 }
            )
        }

        const { data: day, error } = await supabase
            .from('event_days')
            .insert({
                event_id: params.id,
                date,
                image_url: imageUrl,
                description,
                sort_order: sortOrder || 0
            })
            .select()
            .single()

        if (error) {
            console.error('Create day error:', error)
            return NextResponse.json(
                { error: 'Failed to create day' },
                { status: 500 }
            )
        }

        return NextResponse.json({ day }, { status: 201 })
    } catch (error) {
        console.error('Create day error:', error)
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

        // Check permissions
        if (admin.role !== 'super_admin') {
            const { data: adminEvent } = await supabase
                .from('admin_events')
                .select('id')
                .eq('admin_id', adminId)
                .eq('event_id', params.id)
                .single()

            if (!adminEvent) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                )
            }
        }

        const { searchParams } = new URL(request.url)
        const dayId = searchParams.get('dayId')

        if (!dayId) {
            return NextResponse.json(
                { error: 'Day ID is required' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('event_days')
            .delete()
            .eq('id', dayId)
            .eq('event_id', params.id)

        if (error) {
            console.error('Delete day error:', error)
            return NextResponse.json(
                { error: 'Failed to delete day' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete day error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
