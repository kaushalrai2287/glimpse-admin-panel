import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminById } from '@/lib/auth'
import { getEventById, updateEvent } from '@/lib/events'

export async function PATCH(
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

        // Only super admins can toggle event enabled status
        if (admin.role !== 'super_admin') {
            return NextResponse.json(
                { error: 'Only super admins can enable/disable events' },
                { status: 403 }
            )
        }

        const event = await getEventById(params.id)

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            )
        }

        // Toggle the is_enabled status
        const updatedEvent = await updateEvent(params.id, {
            is_enabled: !event.is_enabled,
        })

        if (!updatedEvent) {
            return NextResponse.json(
                { error: 'Failed to update event' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            event: updatedEvent,
            message: `Event ${updatedEvent.is_enabled ? 'enabled' : 'disabled'} successfully`,
        })
    } catch (error) {
        console.error('Toggle event enabled error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
