'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ImageUpload from '@/components/ImageUpload'

interface Venue {
  id: string
  name: string
  address: string
  city?: string
  description?: string
  facilities?: number
  contacts?: number
  photos?: number
}

export default function VenuesPage() {
  const router = useRouter()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const venuesRes = await fetch('/api/venues')
      const userRes = await fetch('/api/auth/me')

      if (venuesRes.ok) {
        const venuesData = await venuesRes.json()
        // Fetch additional details for each venue
        const venuesWithDetails = await Promise.all(
          venuesData.venues.map(async (venue: Venue) => {
            try {
              const detailRes = await fetch(`/api/venues/${venue.id}`)
              if (detailRes.ok) {
                const detailData = await detailRes.json()
                return {
                  ...venue,
                  facilities: detailData.venue.facilities?.length || 0,
                  contacts: detailData.venue.contacts?.length || 0,
                  photos: detailData.venue.photos?.length || 0,
                }
              }
            } catch (error) {
              console.error(`Failed to fetch details for venue ${venue.id}:`, error)
            }
            return venue
          })
        )
        setVenues(venuesWithDetails)
      }

      if (userRes.ok) {
        const userData = await userRes.json()
        setCurrentUser(userData.admin)
      }
    } catch (error) {
      console.error('Fetch data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (venueId: string, venueName: string) => {
    if (!confirm(`Are you sure you want to delete venue "${venueName}"? This action cannot be undone.`)) {
      return
    }

    setDeleteLoading(venueId)
    try {
      const response = await fetch(`/api/venues/${venueId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setVenues(prev => prev.filter(venue => venue.id !== venueId))
        alert('Venue deleted successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete venue')
      }
    } catch (error) {
      console.error('Delete venue error:', error)
      alert('Failed to delete venue')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleCreate = async (formData: FormData) => {
    try {
      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          address: formData.get('address'),
          description: formData.get('description'),
          bgImageUrl: formData.get('bgImageUrl'),
          latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
          longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
          city: formData.get('city'),
        })
      })

      if (response.ok) {
        setShowCreateModal(false)
        fetchData() // Refresh the list
        alert('Venue created successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create venue')
      }
    } catch (error) {
      console.error('Create venue error:', error)
      alert('Failed to create venue')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  const isSuperAdmin = currentUser?.role === 'super_admin'

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Venues</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage event venues and their facilities.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => setShowCreateModal(true)}
              className="admin-btn-primary"
            >
              Create Venue
            </button>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Venue
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Location
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Facilities
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Contacts
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Photos
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {venues.map((venue) => (
                      <tr key={venue.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                          <div className="flex items-center">
                            <div>
                              <div className="font-medium text-gray-900">{venue.name}</div>
                              {venue.description && (
                                <div className="text-gray-500 text-sm max-w-xs truncate">
                                  {venue.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div>{venue.city || 'N/A'}</div>
                          <div className="text-xs text-gray-400 max-w-xs truncate">
                            {venue.address}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {venue.facilities || 0}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {venue.contacts || 0}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {venue.photos || 0}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => router.push(`/dashboard/venues/${venue.id}`)}
                            className="text-[#5550B7] hover:text-[#4540A7] mr-4"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDelete(venue.id, venue.name)}
                            disabled={deleteLoading === venue.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteLoading === venue.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Create Venue Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowCreateModal(false)}>
            <div className="flex min-h-full items-center justify-center p-4">
              <div 
                className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-[#5550B7] to-[#4540A7] px-6 py-4 sticky top-0 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        Create New Venue
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target as HTMLFormElement)
                  handleCreate(formData)
                }} className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-[#5550B7] rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Basic Information</h4>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="name" className="admin-form-label">
                          Venue Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          placeholder="Enter venue name"
                          className="admin-form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="address" className="admin-form-label">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="address"
                          id="address"
                          required
                          rows={3}
                          placeholder="Enter full address"
                          className="admin-form-textarea"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="admin-form-label">
                            City
                          </label>
                          <input
                            type="text"
                            name="city"
                            id="city"
                            placeholder="Enter city name"
                            className="admin-form-input"
                          />
                        </div>

                        <div>
                          <ImageUpload
                            label="Background Image"
                            name="bgImageUrl"
                            category="venues/bg"
                            className="admin-form-group mb-0"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="description" className="admin-form-label">
                          Description
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows={4}
                          placeholder="Enter venue description (optional)"
                          className="admin-form-textarea"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Coordinates */}
                  <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-[#5550B7] rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Location Coordinates</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="latitude" className="admin-form-label">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="latitude"
                          id="latitude"
                          placeholder="e.g., 40.7128"
                          className="admin-form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="longitude" className="admin-form-label">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="longitude"
                          id="longitude"
                          placeholder="e.g., -74.0060"
                          className="admin-form-input"
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Optional: Provide coordinates for map integration
                    </p>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="admin-btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="admin-btn-primary"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Create Venue
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}