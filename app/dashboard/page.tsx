'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'
import type { Event, Admin } from '@/lib/types'

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState<Admin | null>(null)

  useEffect(() => {
    fetchAdmin()
    fetchEvents()
  }, [])

  const fetchAdmin = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      if (response.ok) {
        setAdmin(data.admin)
      }
    } catch (error) {
      console.error('Fetch admin error:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()

      if (response.ok) {
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Fetch events error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">Loading events...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          {admin?.role === 'super_admin' && (
            <div className="flex space-x-3">
              <Link
                href="/dashboard/admins/create"
                className="admin-btn-secondary"
              >
                Create Admin
              </Link>
              <Link
                href="/dashboard/events/create"
                className="admin-btn-primary"
              >
                Create Event
              </Link>
            </div>
          )}
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found.</p>
            {admin?.role === 'super_admin' && (
              <Link
                href="/dashboard/events/create"
                className="mt-4 inline-flex items-center text-[#5550B7] hover:text-[#4540A7] font-medium"
              >
                Create your first event
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : event.status === 'completed'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {event.status}
                    </span>
                  </div>
                  {event.description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Event ID:</span> {event.event_id}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Login Code:</span> {event.login_code}
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Created: {new Date(event.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

