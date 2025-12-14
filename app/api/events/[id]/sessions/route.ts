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

        const { data: sessions, error } = await supabase
            .from('event_sessions')
            .select('*')
            .eq('event_id', params.id)
            .order('sort_order', { ascending: true })

        if (error) {
            console.error('Get sessions error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch sessions' },
                { status: 500 }
            )
        }

        return NextResponse.json({ sessions })
    } catch (error) {
        console.error('Get sessions error:', error)
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

        // Check permissions (simplified for now, ideally check admin_events)
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
            name,
            description,
            imageUrl,
            venueName,
            latitude,
            longitude,
            startTime,
            endTime,
            sortOrder
        } = body

        if (!name) {
            return NextResponse.json(
                { error: 'Session name is required' },
                { status: 400 }
            )
        }

        const { data: session, error } = await supabase
            .from('event_sessions')
            .insert({
                event_id: params.id,
                name,
                description,
                image_url: imageUrl,
                venue_name: venueName,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                start_time: startTime || null,
                end_time: endTime || null,
                sort_order: sortOrder || 0
            })
            .select()
            .single()

        if (error) {
            console.error('Create session error:', error)
            return NextResponse.json(
                { error: 'Failed to create session' },
                { status: 500 }
            )
        }

        return NextResponse.json({ session }, { status: 201 })
    } catch (error) {
        console.error('Create session error:', error)
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
        const sessionId = searchParams.get('sessionId')

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('event_sessions')
            .delete()
            .eq('id', sessionId)
            .eq('event_id', params.id)

        if (error) {
            console.error('Delete session error:', error)
            return NextResponse.json(
                { error: 'Failed to delete session' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete session error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
