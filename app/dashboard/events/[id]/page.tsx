'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'
import type { Event, Admin, PreEventExplore, PreEventHappening, EventSession, EventDay } from '@/lib/types'

interface EventWithAdmins extends Event {
  assigned_admins?: Admin[]
  pre_event_explore?: PreEventExplore[]
  pre_event_happening?: PreEventHappening[]
  event_sessions?: EventSession[]
  event_days?: EventDay[]
}

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<EventWithAdmins | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [admins, setAdmins] = useState<Admin[]>([])

  useEffect(() => {
    fetchAdmin()
    fetchEvent()
  }, [])

  useEffect(() => {
    if (admin?.role === 'super_admin') {
      fetchAdmins()
    }
  }, [admin])

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

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          router.push('/dashboard')
        }
        return
      }

      setEvent(data.event)
    } catch (error) {
      console.error('Fetch event error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admins')
      const data = await response.json()

      if (response.ok) {
        const eventAdmins = data.admins.filter(
          (a: Admin) => a.role === 'event_admin'
        )
        setAdmins(eventAdmins)
      }
    } catch (error) {
      console.error('Fetch admins error:', error)
    }
  }

  const handleAssignAdmin = async (adminId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminIdToAssign: adminId }),
      })

      if (response.ok) {
        fetchEvent()
        fetchAdmins()
      }
    } catch (error) {
      console.error('Assign admin error:', error)
    }
  }

  const handleRemoveAdmin = async (adminId: string) => {
    try {
      const response = await fetch(
        `/api/events/${eventId}/assign?adminId=${adminId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        fetchEvent()
        fetchAdmins()
      }
    } catch (error) {
      console.error('Remove admin error:', error)
    }
  }

  const toggleEventEnabled = async () => {
    if (!event) return

    const action = event.is_enabled ? 'disable' : 'enable'
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this event?\n\n` +
      `Event: ${event.name}\n` +
      `${event.is_enabled ? 'Disabling will hide this event from all non-super admins.' : 'Enabling will make this event visible to assigned admins.'}`
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/events/${eventId}/toggle-enable`, {
        method: 'PATCH',
      })

      if (response.ok) {
        fetchEvent()
      }
    } catch (error) {
      console.error('Toggle event enabled error:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="admin-spinner w-8 h-8 border-[#5550B7] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading event...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-4xl mx-auto">
            <div className="admin-card text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Event not found</h2>
              <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or you don't have access to it.</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="admin-btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Calculate assigned admin IDs and available admins
  const assignedAdminIds: string[] = event.assigned_admins?.map((a) => a.id) || []
  const availableAdmins: Admin[] = admins.filter((a) => !assignedAdminIds.includes(a.id))

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#5550B7] hover:text-[#4540A7] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Events
            </button>
            <Link
              href={`/dashboard/events/create?id=${eventId}`}
              className="admin-btn-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Event
            </Link>
          </div>

          <div className="admin-card">
            {/* Event Header */}
            <div className="mb-6 pb-6 border-b-2 border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h1>
                  {event.description && (
                    <p className="text-gray-600 text-lg">{event.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span
                    className={`admin-badge ${event.status === 'active'
                      ? 'admin-badge-success'
                      : event.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'admin-badge-danger'
                      }`}
                  >
                    {event.status}
                  </span>
                  {admin?.role === 'super_admin' && (
                    <button
                      onClick={toggleEventEnabled}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${event.is_enabled
                        ? 'bg-[#5550B7] text-white hover:bg-[#4540A7]'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      title={event.is_enabled ? 'Click to disable event' : 'Click to enable event'}
                    >
                      {event.is_enabled ? '✓ Enabled' : '✗ Disabled'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Event Information */}
            <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-[#5550B7] rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">Event Information</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Event ID
                  </label>
                  <p className="mt-1 text-sm text-gray-900 font-mono font-semibold">
                    {event.event_id}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Login Code
                  </label>
                  <p className="mt-1 text-sm text-gray-900 font-mono font-semibold">
                    {event.login_code}
                  </p>
                </div>
                {event.start_date && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Start Date
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-semibold">
                      {new Date(event.start_date).toLocaleString()}
                    </p>
                  </div>
                )}
                {event.end_date && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      End Date
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-semibold">
                      {new Date(event.end_date).toLocaleString()}
                    </p>
                  </div>
                )}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Created At
                  </label>
                  <p className="mt-1 text-sm text-gray-900 font-semibold">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

              {admin?.role === 'super_admin' && (
                <div className="border-t-2 border-gray-200 pt-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#5550B7]/10">
                      <svg className="w-5 h-5 text-[#5550B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Assigned Admins
                    </h2>
                  </div>

                  {event.assigned_admins && event.assigned_admins.length > 0 ? (
                    <div className="space-y-3 mb-6">
                      {event.assigned_admins.map((assignedAdmin) => (
                        <div
                          key={assignedAdmin.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-lg hover:border-[#5550B7]/30 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#5550B7]/10">
                              <span className="text-[#5550B7] font-semibold text-sm">
                                {assignedAdmin.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {assignedAdmin.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {assignedAdmin.email}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveAdmin(assignedAdmin.id)}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 text-center">
                        No admins assigned to this event
                      </p>
                    </div>
                  )}

                  {availableAdmins.length > 0 && (
                    <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20">
                      <label className="admin-form-label mb-4">
                        Assign Admin
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignAdmin(e.target.value)
                            e.target.value = ''
                          }
                        }}
                        className="admin-form-select"
                      >
                        <option value="">Select an admin...</option>
                        {availableAdmins.map((admin) => (
                          <option key={admin.id} value={admin.id}>
                            {admin.name} ({admin.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {admin?.role === 'event_admin' && event.assigned_admins && (
                <div className="border-t-2 border-gray-200 pt-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#5550B7]/10">
                      <svg className="w-5 h-5 text-[#5550B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Assigned Admins
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {event.assigned_admins.map((assignedAdmin) => (
                      <div
                        key={assignedAdmin.id}
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#5550B7]/10">
                          <span className="text-[#5550B7] font-semibold text-sm">
                            {assignedAdmin.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {assignedAdmin.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {assignedAdmin.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pre-Event Details */}
            <div className="mt-8 border-t-2 border-gray-200 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#5550B7]/10">
                  <svg className="w-5 h-5 text-[#5550B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Pre-Event Details</h2>
              </div>
              
              <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Banner Image</h3>
                    {event.background_banner_image_url ? (
                      <img src={event.background_banner_image_url} alt="Pre-event Banner" className="w-full h-40 object-cover rounded-lg shadow-sm" />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-gray-400">Not set</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Welcome Text</h3>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {event.welcome_text ? event.welcome_text : <span className="text-gray-400">Not set</span>}
                    </p>
                  </div>
                </div>
              </div>

              {event.pre_event_explore && event.pre_event_explore.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Explore Items</h3>
                    <span className="admin-badge admin-badge-primary">{event.pre_event_explore.length} items</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {event.pre_event_explore.map(item => (
                      <div key={item.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-[#5550B7]/30 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                          <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event.pre_event_happening && event.pre_event_happening.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Happening Items</h3>
                    <span className="admin-badge admin-badge-primary">{event.pre_event_happening.length} items</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {event.pre_event_happening.map(item => (
                      <div key={item.id} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#5550B7]/30 hover:shadow-md transition-all">
                        <img src={item.image_url} alt="Happening" className="w-full h-32 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* During-Event Details */}
            <div className="mt-8 border-t-2 border-gray-200 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#5550B7]/10">
                  <svg className="w-5 h-5 text-[#5550B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">During Event Details</h2>
              </div>
              
              <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Banner Image</h3>
                    {event.during_background_banner_image_url ? (
                      <img src={event.during_background_banner_image_url} alt="During-event Banner" className="w-full h-40 object-cover rounded-lg shadow-sm" />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-gray-400">Not set</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Welcome Text</h3>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {event.during_welcome_text ? event.during_welcome_text : <span className="text-gray-400">Not set</span>}
                    </p>
                  </div>
                </div>
              </div>

              {event.event_sessions && event.event_sessions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Today's Sessions</h3>
                    <span className="admin-badge admin-badge-primary">{event.event_sessions.length} sessions</span>
                  </div>
                  <div className="space-y-4">
                    {event.event_sessions.map(session => (
                      <div key={session.id} className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-[#5550B7]/30 hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          {session.image_url && (
                            <img src={session.image_url} alt={session.name} className="w-24 h-24 rounded-lg object-cover shadow-sm" />
                          )}
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{session.name}</h4>
                            {session.venue_name && (
                              <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-[#5550B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p className="text-sm font-medium text-gray-700">{session.venue_name}</p>
                              </div>
                            )}
                            {session.description && <p className="text-sm text-gray-600 leading-relaxed">{session.description}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Post-Event Details */}
            <div className="mt-8 border-t-2 border-gray-200 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#5550B7]/10">
                  <svg className="w-5 h-5 text-[#5550B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Post Event Details</h2>
              </div>
              
              <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Banner Image</h3>
                    {event.post_background_banner_image_url ? (
                      <img src={event.post_background_banner_image_url} alt="Post-event Banner" className="w-full h-40 object-cover rounded-lg shadow-sm" />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-gray-400">Not set</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Welcome Text</h3>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {event.post_welcome_text ? event.post_welcome_text : <span className="text-gray-400">Not set</span>}
                    </p>
                  </div>
                </div>
              </div>

              {event.event_days && event.event_days.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Event Days</h3>
                    <span className="admin-badge admin-badge-primary">{event.event_days.length} days</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {event.event_days.map(day => (
                      <div key={day.id} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#5550B7]/30 hover:shadow-md transition-all">
                        {day.image_url && (
                          <img src={day.image_url} alt={day.date} className="w-full h-40 object-cover" />
                        )}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-[#5550B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="font-semibold text-gray-900">{new Date(day.date).toLocaleDateString()}</p>
                          </div>
                          {day.description && <p className="text-sm text-gray-600">{day.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </DashboardLayout>
  )
}
