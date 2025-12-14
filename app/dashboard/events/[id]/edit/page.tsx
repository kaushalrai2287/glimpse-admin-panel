'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditEventPage() {
    const router = useRouter()
    const params = useParams()
    const eventId = params.id as string

    useEffect(() => {
        // Redirect to the create page with event ID as query param
        // We'll reuse the create page for editing
        router.push(`/dashboard/events/create?id=${eventId}`)
    }, [eventId, router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <p className="text-gray-600">Redirecting to edit page...</p>
            </div>
        </div>
    )
}
