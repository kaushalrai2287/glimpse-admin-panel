'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface Venue {
  id: string
  name: string
  address: string
  description?: string
  bg_image_url?: string
  latitude?: number
  longitude?: number
  city?: string
  created_at: string
  updated_at: string
}

interface Facility {
  id: string
  name: string
  image_url?: string
  created_at: string
}

interface Contact {
  id: string
  name: string
  image_url?: string
  phone_number?: string
  email?: string
  created_at: string
}

interface Photo {
  id: string
  image_url: string
  alt_text?: string
  sort_order: number
  created_at: string
}

export default function VenueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFacilityModal, setShowFacilityModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      const [venueRes, userRes] = await Promise.all([
        fetch(`/api/venues/${params.id}`),
        fetch('/api/auth/me')
      ])

      if (venueRes.ok) {
        const data = await venueRes.json()
        setVenue(data.venue)
        setFacilities(data.venue.facilities || [])
        setContacts(data.venue.contacts || [])
        setPhotos(data.venue.photos || [])
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

  const handleAddFacility = async (formData: FormData) => {
    try {
      const response = await fetch(`/api/venues/${params.id}/facilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          imageUrl: formData.get('imageUrl'),
        })
      })

      if (response.ok) {
        setShowFacilityModal(false)
        fetchData()
      } else {
        alert('Failed to add facility')
      }
    } catch (error) {
      console.error('Add facility error:', error)
      alert('Failed to add facility')
    }
  }

  const handleRemoveFacility = async (facilityId: string) => {
    if (!confirm('Are you sure you want to remove this facility?')) return

    try {
      const response = await fetch(`/api/venues/${params.id}/facilities?facilityId=${facilityId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      } else {
        alert('Failed to remove facility')
      }
    } catch (error) {
      console.error('Remove facility error:', error)
      alert('Failed to remove facility')
    }
  }

  const handleAddContact = async (formData: FormData) => {
    try {
      const response = await fetch(`/api/venues/${params.id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          imageUrl: formData.get('imageUrl'),
          phoneNumber: formData.get('phoneNumber'),
          email: formData.get('email'),
        })
      })

      if (response.ok) {
        setShowContactModal(false)
        fetchData()
      } else {
        alert('Failed to add contact')
      }
    } catch (error) {
      console.error('Add contact error:', error)
      alert('Failed to add contact')
    }
  }

  const handleRemoveContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to remove this contact?')) return

    try {
      const response = await fetch(`/api/venues/${params.id}/contacts?contactId=${contactId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      } else {
        alert('Failed to remove contact')
      }
    } catch (error) {
      console.error('Remove contact error:', error)
      alert('Failed to remove contact')
    }
  }

  const handleAddPhoto = async (formData: FormData) => {
    try {
      const response = await fetch(`/api/venues/${params.id}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: formData.get('imageUrl'),
          altText: formData.get('altText'),
          sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
        })
      })

      if (response.ok) {
        setShowPhotoModal(false)
        fetchData()
      } else {
        alert('Failed to add photo')
      }
    } catch (error) {
      console.error('Add photo error:', error)
      alert('Failed to add photo')
    }
  }

  const handleRemovePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to remove this photo?')) return

    try {
      const response = await fetch(`/api/venues/${params.id}/photos?photoId=${photoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      } else {
        alert('Failed to remove photo')
      }
    } catch (error) {
      console.error('Remove photo error:', error)
      alert('Failed to remove photo')
    }
  }

  const handleUpdateVenue = async (formData: FormData) => {
    try {
      const bgImageUrl = formData.get('bgImageUrl') as string
      const latitudeStr = formData.get('latitude') as string
      const longitudeStr = formData.get('longitude') as string
      
      const updateData: any = {
        name: formData.get('name'),
        address: formData.get('address'),
      }

      const description = formData.get('description') as string
      const city = formData.get('city') as string
      
      if (description) updateData.description = description
      if (city) updateData.city = city
      if (bgImageUrl) updateData.bg_image_url = bgImageUrl
      if (latitudeStr) updateData.latitude = parseFloat(latitudeStr)
      if (longitudeStr) updateData.longitude = parseFloat(longitudeStr)

      const response = await fetch(`/api/venues/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        setShowEditModal(false)
        fetchData()
        alert('Venue updated successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update venue')
      }
    } catch (error) {
      console.error('Update venue error:', error)
      alert('Failed to update venue')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading venue details...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!venue) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Venue Not Found</h2>
          <p className="mt-2 text-gray-600">The venue you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard/venues')}
            className="mt-4 text-[#5550B7] hover:text-[#4540A7]"
          >
            ← Back to Venues
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const isSuperAdmin = currentUser?.role === 'super_admin'

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/venues')}
            className="text-[#5550B7] hover:text-[#4540A7] mb-4 inline-flex items-center"
          >
            ← Back to Venues
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
              <p className="mt-1 text-gray-600">{venue.address}</p>
              {venue.city && <p className="text-gray-500">{venue.city}</p>}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="admin-btn-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Venue
              </button>
              {isSuperAdmin && (
                <>
                  <button
                    onClick={() => setShowFacilityModal(true)}
                    className="admin-btn-secondary"
                  >
                    Add Facility
                  </button>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="admin-btn-secondary"
                  >
                    Add Contact
                  </button>
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    className="admin-btn-secondary"
                  >
                    Add Photo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Venue Details */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Venue Information</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{venue.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">City</dt>
              <dd className="mt-1 text-sm text-gray-900">{venue.city || 'N/A'}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{venue.address}</dd>
            </div>
            {venue.description && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{venue.description}</dd>
              </div>
            )}
            {(venue.latitude || venue.longitude) && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Coordinates</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {venue.latitude}, {venue.longitude}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Facilities */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Facilities ({facilities.length})</h2>
          </div>
          {facilities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No facilities added yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facilities.map((facility) => (
                <div key={facility.id} className="border rounded-lg p-4">
                  {facility.image_url && (
                    <img
                      src={facility.image_url}
                      alt={facility.name}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="font-medium text-gray-900">{facility.name}</h3>
                  {isSuperAdmin && (
                    <button
                      onClick={() => handleRemoveFacility(facility.id)}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contacts (SPOC) */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Contacts (SPOC) ({contacts.length})</h2>
          </div>
          {contacts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No contacts added yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    {contact.image_url && (
                      <img
                        src={contact.image_url}
                        alt={contact.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{contact.name}</h3>
                      {contact.phone_number && (
                        <p className="text-sm text-gray-600">📞 {contact.phone_number}</p>
                      )}
                      {contact.email && (
                        <p className="text-sm text-gray-600">✉️ {contact.email}</p>
                      )}
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleRemoveContact(contact.id)}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Photos */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Venue Photos ({photos.length})</h2>
          </div>
          {photos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No photos added yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.image_url}
                    alt={photo.alt_text || 'Venue photo'}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {photo.alt_text && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                      <p className="text-sm">{photo.alt_text}</p>
                    </div>
                  )}
                  {isSuperAdmin && (
                    <button
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Venue Modal */}
        {showEditModal && (
          <EditVenueModal
            venue={venue}
            onClose={() => setShowEditModal(false)}
            onSubmit={handleUpdateVenue}
          />
        )}

        {/* Facility Modal */}
        {showFacilityModal && (
          <FacilityModal
            onClose={() => setShowFacilityModal(false)}
            onSubmit={handleAddFacility}
          />
        )}

        {/* Contact Modal */}
        {showContactModal && (
          <ContactModal
            onClose={() => setShowContactModal(false)}
            onSubmit={handleAddContact}
          />
        )}

        {/* Photo Modal */}
        {showPhotoModal && (
          <PhotoModal
            onClose={() => setShowPhotoModal(false)}
            onSubmit={handleAddPhoto}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

// Modal Components
function EditVenueModal({ venue, onClose, onSubmit }: { venue: Venue; onClose: () => void; onSubmit: (data: FormData) => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Edit Venue
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
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
            onSubmit(formData)
          }} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-[#5550B7] rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Basic Information</h4>
              </div>
              <div className="space-y-5">
                <div>
                  <label htmlFor="edit-name" className="admin-form-label">
                    Venue Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="edit-name"
                    required
                    defaultValue={venue.name}
                    placeholder="Enter venue name"
                    className="admin-form-input"
                  />
                </div>

                <div>
                  <label htmlFor="edit-address" className="admin-form-label">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    id="edit-address"
                    required
                    rows={3}
                    defaultValue={venue.address}
                    placeholder="Enter full address"
                    className="admin-form-textarea"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-city" className="admin-form-label">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="edit-city"
                      defaultValue={venue.city || ''}
                      placeholder="Enter city name"
                      className="admin-form-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-bgImageUrl" className="admin-form-label">
                      Background Image URL
                    </label>
                    <input
                      type="url"
                      name="bgImageUrl"
                      id="edit-bgImageUrl"
                      defaultValue={venue.bg_image_url || ''}
                      placeholder="https://example.com/image.jpg"
                      className="admin-form-input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-description" className="admin-form-label">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="edit-description"
                    rows={4}
                    defaultValue={venue.description || ''}
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
                  <label htmlFor="edit-latitude" className="admin-form-label">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    id="edit-latitude"
                    defaultValue={venue.latitude || ''}
                    placeholder="e.g., 40.7128"
                    className="admin-form-input"
                  />
                </div>

                <div>
                  <label htmlFor="edit-longitude" className="admin-form-label">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    id="edit-longitude"
                    defaultValue={venue.longitude || ''}
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
                onClick={onClose}
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
                Update Venue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function FacilityModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: FormData) => void }) {
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Add Facility
              </h3>
            </div>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            onSubmit(formData)
          }} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Facility Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5550B7] focus:ring-[#5550B7] text-gray-900 placeholder-gray-500 bg-white sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                id="imageUrl"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5550B7] focus:ring-[#5550B7] text-gray-900 placeholder-gray-500 bg-white sm:text-sm"
              />
            </div>

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-md bg-[#5550B7] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4540A7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5550B7] sm:col-start-2"
              >
                Add Facility
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function ContactModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: FormData) => void }) {
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Add Contact (SPOC)
              </h3>
            </div>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            onSubmit(formData)
          }} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Contact Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5550B7] focus:ring-[#5550B7] text-gray-900 placeholder-gray-500 bg-white sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                id="imageUrl"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5550B7] focus:ring-[#5550B7] text-gray-900 placeholder-gray-500 bg-white sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5550B7] focus:ring-[#5550B7] text-gray-900 placeholder-gray-500 bg-white sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5550B7] focus:ring-[#5550B7] text-gray-900 placeholder-gray-500 bg-white sm:text-sm"
              />
            </div>

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-md bg-[#5550B7] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4540A7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5550B7] sm:col-start-2"
              >
                Add Contact
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function PhotoModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: FormData) => void }) {
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Add Venue Photo
              </h3>
            </div>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            onSubmit(formData)
          }} className="mt-6 space-y-4">
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                Image URL *
              </label>
              <input
                type="url"
                name="imageUrl"
                id="imageUrl"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5550B7] focus:ring-[#5550B7] text-gray-900 placeholder-gray-500 bg-white sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="altText" className="block text-sm font-medium text-gray-700">
                Alt Text / Description
              </label>
              <input
                type="text"
                name="altText"
                id="altText"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5550B7] focus:ring-[#5550B7] text-gray-900 placeholder-gray-500 bg-white sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
                Sort Order
              </label>
              <input
                type="number"
                name="sortOrder"
                id="sortOrder"
                defaultValue="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5550B7] focus:ring-[#5550B7] text-gray-900 placeholder-gray-500 bg-white sm:text-sm"
              />
            </div>

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-md bg-[#5550B7] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4540A7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5550B7] sm:col-start-2"
              >
                Add Photo
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}