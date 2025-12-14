'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

interface Category {
  id: string
  name: string
  description?: string
}

interface Venue {
  id: string
  name: string
  address: string
  city?: string
}

interface Admin {
  id: string
  name: string
  email: string
  role: string
}

export default function CreateEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('id')
  const isEditMode = !!eventId

  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [currentStep, setCurrentStep] = useState(1)

  // Form data
  const [formData, setFormData] = useState({
    // Section A: Primary Event Details
    name: '',
    description: '',
    categoryId: '',
    startDate: '',
    endDate: '',
    loginCode: '',
    splashImageUrl: '',
    primaryColor: '#5550B7',
    secondaryColor: '#1F2937',

    // Section B: Venue Details
    venueId: '',
    venueName: '',
    venueAddress: '',
    venueDescription: '',
    venueBgImage: '',
    venueLat: '',
    venueLng: '',
    venueCity: '',

    // Section C: Pre-event Details
    backgroundBannerImageUrl: '',
    bannerTextColor: '#FFFFFF',
    welcomeText: '',

    // Section C: During-event Details
    duringBackgroundBannerImageUrl: '',
    duringBannerTextColor: '#FFFFFF',
    duringWelcomeText: '',

    // Section D: Post-event Details
    postBackgroundBannerImageUrl: '',
    postBannerTextColor: '#FFFFFF',
    postWelcomeText: '',

    // Assigned admins
    assignedAdmins: [] as string[],
  })

  // Venue facilities, contacts, photos
  const [venueFacilities, setVenueFacilities] = useState<Array<{ name: string, imageUrl: string }>>([])
  const [venueContacts, setVenueContacts] = useState<Array<{ name: string, imageUrl?: string, phoneNumber?: string, email?: string }>>([])
  const [venuePhotos, setVenuePhotos] = useState<Array<{ imageUrl: string, altText?: string }>>([])

  // Pre-event content
  const [exploreItems, setExploreItems] = useState<Array<{ name: string, imageUrl: string }>>([])
  const [happeningItems, setHappeningItems] = useState<Array<{ imageUrl: string, altText?: string }>>([])

  // During-event content
  const [sessions, setSessions] = useState<Array<{
    name: string,
    description?: string,
    imageUrl?: string,
    venueName?: string,
    latitude?: string,
    longitude?: string,
    startTime?: string,
    endTime?: string
  }>>([])

  // Post-event content
  const [eventDays, setEventDays] = useState<Array<{
    date: string,
    imageUrl?: string,
    description?: string
  }>>([])

  // Current user
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchData()
    if (eventId) {
      fetchEventData(eventId)
    }
  }, [eventId])

  const fetchEventData = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${id}`)
      if (response.ok) {
        const { event } = await response.json()

        // Populate form data
        setFormData(prev => ({
          ...prev,
          name: event.name,
          description: event.description || '',
          categoryId: event.category_id || '',
          startDate: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
          endDate: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
          loginCode: event.login_code,
          splashImageUrl: event.splash_image_url || '',
          primaryColor: event.primary_color || '#5550B7',
          secondaryColor: event.secondary_color || '#1F2937',
          venueId: event.venue_id || '',
          assignedAdmins: event.assigned_admins?.map((a: any) => a.id) || [],

          // Pre-event
          backgroundBannerImageUrl: event.background_banner_image_url || '',
          bannerTextColor: event.banner_text_color || '#FFFFFF',
          welcomeText: event.welcome_text || '',

          // During-event
          duringBackgroundBannerImageUrl: event.during_background_banner_image_url || '',
          duringBannerTextColor: event.during_banner_text_color || '#FFFFFF',
          duringWelcomeText: event.during_welcome_text || '',

          // Post-event
          postBackgroundBannerImageUrl: event.post_background_banner_image_url || '',
          postBannerTextColor: event.post_banner_text_color || '#FFFFFF',
          postWelcomeText: event.post_welcome_text || '',
        }))

        // Fetch related content
        const [exploreRes, happeningRes, sessionsRes, daysRes] = await Promise.all([
          fetch(`/api/events/${id}/content/explore`),
          fetch(`/api/events/${id}/content/happening`),
          fetch(`/api/events/${id}/sessions`),
          fetch(`/api/events/${id}/days`)
        ])

        if (exploreRes.ok) {
          const { explore } = await exploreRes.json()
          setExploreItems(explore.map((item: any) => ({ name: item.name, imageUrl: item.image_url, id: item.id })))
        }
        if (happeningRes.ok) {
          const { happening } = await happeningRes.json()
          setHappeningItems(happening.map((item: any) => ({ imageUrl: item.image_url, altText: item.alt_text, id: item.id })))
        }
        if (sessionsRes.ok) {
          const { sessions } = await sessionsRes.json()
          setSessions(sessions.map((s: any) => ({
            name: s.name,
            description: s.description,
            imageUrl: s.image_url,
            venueName: s.venue_name,
            latitude: s.latitude,
            longitude: s.longitude,
            startTime: s.start_time,
            endTime: s.end_time,
            id: s.id
          })))
        }
        if (daysRes.ok) {
          const { days } = await daysRes.json()
          setEventDays(days.map((d: any) => ({
            date: d.date,
            imageUrl: d.image_url,
            description: d.description,
            id: d.id
          })))
        }
      }
    } catch (error) {
      console.error('Fetch event error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      const [categoriesRes, venuesRes, adminsRes, userRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/venues'),
        fetch('/api/admins'),
        fetch('/api/auth/me')
      ])

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.categories)
      }

      if (venuesRes.ok) {
        const data = await venuesRes.json()
        setVenues(data.venues)
      }

      if (adminsRes.ok) {
        const data = await adminsRes.json()
        setAdmins(data.admins.filter((admin: Admin) => admin.role === 'event_admin'))
      }

      if (userRes.ok) {
        const data = await userRes.json()
        setCurrentUser(data.admin)
      }
    } catch (error) {
      console.error('Fetch data error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create venue if new venue details provided
      let finalVenueId = formData.venueId
      if (!finalVenueId && formData.venueName && formData.venueAddress) {
        const venueResponse = await fetch('/api/venues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.venueName,
            address: formData.venueAddress,
            description: formData.venueDescription,
            bgImageUrl: formData.venueBgImage,
            latitude: formData.venueLat ? parseFloat(formData.venueLat) : undefined,
            longitude: formData.venueLng ? parseFloat(formData.venueLng) : undefined,
            city: formData.venueCity,
          })
        })

        if (venueResponse.ok) {
          const venueData = await venueResponse.json()
          finalVenueId = venueData.venue.id

          // Add facilities, contacts, photos to the new venue
          await Promise.all([
            ...venueFacilities.map(facility =>
              fetch(`/api/venues/${finalVenueId}/facilities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(facility)
              })
            ),
            ...venueContacts.map(contact =>
              fetch(`/api/venues/${finalVenueId}/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contact)
              })
            ),
            ...venuePhotos.map((photo, index) =>
              fetch(`/api/venues/${finalVenueId}/photos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...photo, sortOrder: index })
              })
            )
          ])
        }
      }

      // Create or Update event
      const url = isEditMode ? `/api/events/${eventId}` : '/api/events'
      const method = isEditMode ? 'PATCH' : 'POST'

      const eventResponse = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          categoryId: formData.categoryId || undefined,
          venueId: finalVenueId || undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          loginCode: formData.loginCode || undefined,
          assignedAdmins: formData.assignedAdmins,
          splashImageUrl: formData.splashImageUrl || undefined,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,

          // Pre-event
          backgroundBannerImageUrl: formData.backgroundBannerImageUrl || undefined,
          bannerTextColor: formData.bannerTextColor,
          welcomeText: formData.welcomeText || undefined,

          // During-event
          duringBackgroundBannerImageUrl: formData.duringBackgroundBannerImageUrl || undefined,
          duringBannerTextColor: formData.duringBannerTextColor,
          duringWelcomeText: formData.duringWelcomeText || undefined,

          // Post-event
          postBackgroundBannerImageUrl: formData.postBackgroundBannerImageUrl || undefined,
          postBannerTextColor: formData.postBannerTextColor,
          postWelcomeText: formData.postWelcomeText || undefined,
        })
      })

      if (!eventResponse.ok) {
        throw new Error('Failed to save event')
      }

      const eventData = await eventResponse.json()
      const savedEventId = isEditMode ? eventId : eventData.event.id

      // Handle related content
      // For simplicity in this iteration, we'll delete existing and re-create for lists if in edit mode
      // A more optimized approach would be to diff and update/create/delete individually

      if (isEditMode) {
        // Fetch existing to get IDs for deletion
        const [exploreRes, happeningRes, sessionsRes, daysRes] = await Promise.all([
          fetch(`/api/events/${savedEventId}/content/explore`),
          fetch(`/api/events/${savedEventId}/content/happening`),
          fetch(`/api/events/${savedEventId}/sessions`),
          fetch(`/api/events/${savedEventId}/days`)
        ])

        if (exploreRes.ok) {
          const { explore } = await exploreRes.json()
          await Promise.all(explore.map((item: any) => fetch(`/api/events/${savedEventId}/content/explore?exploreId=${item.id}`, { method: 'DELETE' })))
        }
        if (happeningRes.ok) {
          const { happening } = await happeningRes.json()
          await Promise.all(happening.map((item: any) => fetch(`/api/events/${savedEventId}/content/happening?happeningId=${item.id}`, { method: 'DELETE' })))
        }
        if (sessionsRes.ok) {
          const { sessions } = await sessionsRes.json()
          await Promise.all(sessions.map((item: any) => fetch(`/api/events/${savedEventId}/sessions?sessionId=${item.id}`, { method: 'DELETE' })))
        }
        if (daysRes.ok) {
          const { days } = await daysRes.json()
          await Promise.all(days.map((item: any) => fetch(`/api/events/${savedEventId}/days?dayId=${item.id}`, { method: 'DELETE' })))
        }
      }

      // Add content (new or re-added)
      await Promise.all([
        ...exploreItems.map((item, index) =>
          fetch(`/api/events/${savedEventId}/content/explore`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, sortOrder: index })
          })
        ),
        ...happeningItems.map((item, index) =>
          fetch(`/api/events/${savedEventId}/content/happening`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, sortOrder: index })
          })
        ),
        // Add sessions
        ...sessions.map((session, index) =>
          fetch(`/api/events/${savedEventId}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...session, sortOrder: index })
          })
        ),
        // Add days
        ...eventDays.map((day, index) =>
          fetch(`/api/events/${savedEventId}/days`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...day, sortOrder: index })
          })
        )
      ])

      // Refresh the venues list to show the newly created venue
      await fetchData()
      router.push('/dashboard')
    } catch (error) {
      console.error('Save event error:', error)
      alert('Failed to save event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
          <p className="mt-2 text-gray-600">{isEditMode ? 'Update the event details below.' : 'Fill out the form below to create a new event with all details.'}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {['Primary', 'Venue', 'Pre-Event', 'During Event', 'Post Event'].map((step, index) => (
              <div key={index} className="flex items-center min-w-max mr-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep > index + 1 ? 'bg-green-500 text-white' :
                  currentStep === index + 1 ? 'bg-[#5550B7] text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                  {index + 1}
                </div>
                <span className={`ml-3 ${currentStep === index + 1 ? 'text-[#5550B7] font-medium' : 'text-gray-600'}`}>
                  {step}
                </span>
                {index < 4 && <div className="ml-4 w-8 h-0.5 bg-gray-300 hidden md:block"></div>}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section A: Primary Event Details */}
          {currentStep === 1 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Section A: Primary Event Details</h2>
              </div>
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-[#5550B7] rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 admin-form-group mb-0">
                      <label className="admin-form-label">Event Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        className="admin-form-input"
                        placeholder="Enter event name"
                      />
                    </div>

                    <div className="md:col-span-2 admin-form-group mb-0">
                      <label className="admin-form-label">Description</label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        className="admin-form-textarea"
                        placeholder="Enter event description"
                      />
                    </div>

                    <div className="admin-form-group mb-0">
                      <label className="admin-form-label">Category</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => updateFormData('categoryId', e.target.value)}
                        className="admin-form-select"
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      {currentUser?.role === 'super_admin' && (
                        <p className="mt-1 text-xs text-gray-500">
                          <a href="/dashboard/categories" target="_blank" className="text-[#5550B7] hover:text-[#4540A7] font-medium">
                            Manage categories →
                          </a>
                        </p>
                      )}
                    </div>

                    <div className="admin-form-group mb-0">
                      <label className="admin-form-label">Login Code</label>
                      <input
                        type="text"
                        value={formData.loginCode}
                        onChange={(e) => updateFormData('loginCode', e.target.value)}
                        className="admin-form-input"
                        placeholder="Auto-generated if empty"
                      />
                    </div>

                    <div className="admin-form-group mb-0">
                      <label className="admin-form-label">Start Date</label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => updateFormData('startDate', e.target.value)}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group mb-0">
                      <label className="admin-form-label">End Date</label>
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => updateFormData('endDate', e.target.value)}
                        className="admin-form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Styling */}
                <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-[#5550B7] rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Event Styling</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="admin-form-group mb-0">
                      <label className="admin-form-label">Splash Image URL</label>
                      <input
                        type="url"
                        value={formData.splashImageUrl}
                        onChange={(e) => updateFormData('splashImageUrl', e.target.value)}
                        className="admin-form-input"
                        placeholder="https://example.com/splash.jpg"
                      />
                    </div>

                    <div className="admin-form-group mb-0">
                      <label className="admin-form-label">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => updateFormData('primaryColor', e.target.value)}
                          className="w-16 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm hover:border-[#5550B7] transition-colors"
                        />
                        <input
                          type="text"
                          value={formData.primaryColor}
                          onChange={(e) => updateFormData('primaryColor', e.target.value)}
                          className="admin-form-input flex-1"
                          placeholder="#5550B7"
                        />
                      </div>
                    </div>

                    <div className="admin-form-group mb-0">
                      <label className="admin-form-label">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                          className="w-16 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm hover:border-[#5550B7] transition-colors"
                        />
                        <input
                          type="text"
                          value={formData.secondaryColor}
                          onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                          className="admin-form-input flex-1"
                          placeholder="#1F2937"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assign Admins */}
                <div className="border-t-2 border-gray-200 pt-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#5550B7]/10">
                      <svg className="w-5 h-5 text-[#5550B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Assign Event Admins</h3>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto admin-scrollbar border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    {admins.map(admin => (
                      <label key={admin.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-[#5550B7]/30 hover:shadow-sm transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assignedAdmins.includes(admin.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFormData('assignedAdmins', [...formData.assignedAdmins, admin.id])
                            } else {
                              updateFormData('assignedAdmins', formData.assignedAdmins.filter(id => id !== admin.id))
                            }
                          }}
                          className="admin-form-checkbox w-5 h-5"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">{admin.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({admin.email})</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section B: Venue Details */}
          {currentStep === 2 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Section B: Venue Details</h2>
              </div>

              <div className="space-y-8">
                <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-[#5550B7] rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Venue Selection</h3>
                  </div>
                  
                  <div className="admin-form-group mb-0">
                    <label className="admin-form-label">Select Existing Venue</label>
                    <select
                      value={formData.venueId}
                      onChange={(e) => updateFormData('venueId', e.target.value)}
                      className="admin-form-select"
                    >
                      <option value="">Create New Venue</option>
                      {venues.map(venue => (
                        <option key={venue.id} value={venue.id}>{venue.name} - {venue.city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!formData.venueId && (
                  <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-6 bg-[#5550B7] rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-900">New Venue Details</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 admin-form-group mb-0">
                          <label className="admin-form-label">Venue Name *</label>
                          <input
                            type="text"
                            required
                            value={formData.venueName}
                            onChange={(e) => updateFormData('venueName', e.target.value)}
                            className="admin-form-input"
                            placeholder="Enter venue name"
                          />
                        </div>

                        <div className="md:col-span-2 admin-form-group mb-0">
                          <label className="admin-form-label">Venue Address *</label>
                          <textarea
                            required
                            rows={3}
                            value={formData.venueAddress}
                            onChange={(e) => updateFormData('venueAddress', e.target.value)}
                            className="admin-form-textarea"
                            placeholder="Enter full address"
                          />
                        </div>

                        <div className="admin-form-group mb-0">
                          <label className="admin-form-label">City</label>
                          <input
                            type="text"
                            value={formData.venueCity}
                            onChange={(e) => updateFormData('venueCity', e.target.value)}
                            className="admin-form-input"
                            placeholder="Enter city name"
                          />
                        </div>

                        <div className="admin-form-group mb-0">
                          <label className="admin-form-label">Background Image URL</label>
                          <input
                            type="url"
                            value={formData.venueBgImage}
                            onChange={(e) => updateFormData('venueBgImage', e.target.value)}
                            className="admin-form-input"
                            placeholder="https://example.com/venue.jpg"
                          />
                        </div>

                        <div className="admin-form-group mb-0">
                          <label className="admin-form-label">Latitude</label>
                          <input
                            type="number"
                            step="any"
                            value={formData.venueLat}
                            onChange={(e) => updateFormData('venueLat', e.target.value)}
                            className="admin-form-input"
                            placeholder="e.g., 40.7128"
                          />
                        </div>

                        <div className="admin-form-group mb-0">
                          <label className="admin-form-label">Longitude</label>
                          <input
                            type="number"
                            step="any"
                            value={formData.venueLng}
                            onChange={(e) => updateFormData('venueLng', e.target.value)}
                            className="admin-form-input"
                            placeholder="e.g., -74.0060"
                          />
                        </div>
                      </div>

                      <div className="admin-form-group mb-0">
                        <label className="admin-form-label">Venue Description</label>
                        <textarea
                          rows={4}
                          value={formData.venueDescription}
                          onChange={(e) => updateFormData('venueDescription', e.target.value)}
                          className="admin-form-textarea"
                          placeholder="Enter venue description"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section C: Pre-Event Details */}
          {currentStep === 3 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Section C: Pre-Event Details</h2>
              </div>

              <div className="space-y-8">
                {/* Pre-Event Configuration Section */}
                <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-[#5550B7] rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Pre-Event Configuration</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="admin-form-group mb-0">
                        <label className="admin-form-label">Background Banner Image URL</label>
                        <input
                          type="url"
                          value={formData.backgroundBannerImageUrl}
                          onChange={(e) => updateFormData('backgroundBannerImageUrl', e.target.value)}
                          className="admin-form-input"
                          placeholder="https://example.com/banner.jpg"
                        />
                      </div>

                      <div className="admin-form-group mb-0">
                        <label className="admin-form-label">Banner Text Color</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={formData.bannerTextColor}
                            onChange={(e) => updateFormData('bannerTextColor', e.target.value)}
                            className="w-16 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm hover:border-[#5550B7] transition-colors"
                          />
                          <input
                            type="text"
                            value={formData.bannerTextColor}
                            onChange={(e) => updateFormData('bannerTextColor', e.target.value)}
                            className="admin-form-input flex-1"
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="admin-form-group mb-0">
                      <label className="admin-form-label">Welcome Text</label>
                      <textarea
                        rows={4}
                        value={formData.welcomeText}
                        onChange={(e) => updateFormData('welcomeText', e.target.value)}
                        className="admin-form-textarea"
                        placeholder="Enter a welcoming message for your event attendees..."
                      />
                    </div>
                  </div>
                </div>

                {/* Explore Items */}
                <div className="border-t-2 border-gray-200 pt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#5550B7]/10">
                      <svg className="w-5 h-5 text-[#5550B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Explore Before Event (List)</h3>
                  </div>
                  <div className="space-y-4">
                    {exploreItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-lg bg-white hover:border-[#5550B7]/30 hover:shadow-md transition-all">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Item Name"
                            value={item.name}
                            onChange={(e) => {
                              const newItems = [...exploreItems]
                              newItems[index].name = e.target.value
                              setExploreItems(newItems)
                            }}
                            className="admin-form-input text-sm"
                          />
                          <input
                            type="url"
                            placeholder="Image URL"
                            value={item.imageUrl}
                            onChange={(e) => {
                              const newItems = [...exploreItems]
                              newItems[index].imageUrl = e.target.value
                              setExploreItems(newItems)
                            }}
                            className="admin-form-input text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setExploreItems(exploreItems.filter((_, i) => i !== index))}
                          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setExploreItems([...exploreItems, { name: '', imageUrl: '' }])}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#5550B7] bg-[#5550B7]/10 rounded-lg hover:bg-[#5550B7]/20 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Explore Item
                    </button>
                  </div>
                </div>

                {/* Happening Items */}
                <div className="border-t-2 border-gray-200 pt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#5550B7]/10">
                      <svg className="w-5 h-5 text-[#5550B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Current Happening (List)</h3>
                  </div>
                  <div className="space-y-4">
                    {happeningItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-lg bg-white hover:border-[#5550B7]/30 hover:shadow-md transition-all">
                        <div className="flex-1">
                          <input
                            type="url"
                            placeholder="Image URL"
                            value={item.imageUrl}
                            onChange={(e) => {
                              const newItems = [...happeningItems]
                              newItems[index].imageUrl = e.target.value
                              setHappeningItems(newItems)
                            }}
                            className="admin-form-input text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setHappeningItems(happeningItems.filter((_, i) => i !== index))}
                          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setHappeningItems([...happeningItems, { imageUrl: '' }])}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#5550B7] bg-[#5550B7]/10 rounded-lg hover:bg-[#5550B7]/20 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Happening Item
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section D: During Event Details */}
          {currentStep === 4 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Section C: During Event Details</h2>
              </div>

              <div className="space-y-8">
                {/* During-Event Configuration Section */}
                <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-[#5550B7] rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">During-Event Configuration</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="admin-form-group mb-0">
                        <label className="admin-form-label">Background Banner Image URL</label>
                        <input
                          type="url"
                          value={formData.duringBackgroundBannerImageUrl}
                          onChange={(e) => updateFormData('duringBackgroundBannerImageUrl', e.target.value)}
                          className="admin-form-input"
                          placeholder="https://example.com/banner.jpg"
                        />
                      </div>

                      <div className="admin-form-group mb-0">
                        <label className="admin-form-label">Banner Text Color</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={formData.duringBannerTextColor}
                            onChange={(e) => updateFormData('duringBannerTextColor', e.target.value)}
                            className="w-16 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm hover:border-[#5550B7] transition-colors"
                          />
                          <input
                            type="text"
                            value={formData.duringBannerTextColor}
                            onChange={(e) => updateFormData('duringBannerTextColor', e.target.value)}
                            className="admin-form-input flex-1"
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="admin-form-group mb-0">
                      <label className="admin-form-label">Welcome Text</label>
                      <textarea
                        rows={4}
                        value={formData.duringWelcomeText}
                        onChange={(e) => updateFormData('duringWelcomeText', e.target.value)}
                        className="admin-form-textarea"
                        placeholder="Enter a welcoming message for during the event..."
                      />
                    </div>
                  </div>
                </div>

                {/* Sessions */}
                <div className="border-t-2 border-gray-200 pt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#5550B7]/10">
                      <svg className="w-5 h-5 text-[#5550B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Today's Sessions</h3>
                  </div>
                  <div className="space-y-4">
                    {sessions.map((session, index) => (
                      <div key={index} className="p-5 border-2 border-gray-200 rounded-lg bg-white hover:border-[#5550B7]/30 hover:shadow-md transition-all space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Session Name"
                            value={session.name}
                            onChange={(e) => {
                              const newSessions = [...sessions]
                              newSessions[index].name = e.target.value
                              setSessions(newSessions)
                            }}
                            className="admin-form-input text-sm"
                          />
                          <input
                            type="url"
                            placeholder="Image URL"
                            value={session.imageUrl}
                            onChange={(e) => {
                              const newSessions = [...sessions]
                              newSessions[index].imageUrl = e.target.value
                              setSessions(newSessions)
                            }}
                            className="admin-form-input text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Venue Name"
                            value={session.venueName}
                            onChange={(e) => {
                              const newSessions = [...sessions]
                              newSessions[index].venueName = e.target.value
                              setSessions(newSessions)
                            }}
                            className="admin-form-input text-sm"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              step="any"
                              placeholder="Latitude"
                              value={session.latitude}
                              onChange={(e) => {
                                const newSessions = [...sessions]
                                newSessions[index].latitude = e.target.value
                                setSessions(newSessions)
                              }}
                              className="admin-form-input text-sm"
                            />
                            <input
                              type="number"
                              step="any"
                              placeholder="Longitude"
                              value={session.longitude}
                              onChange={(e) => {
                                const newSessions = [...sessions]
                                newSessions[index].longitude = e.target.value
                                setSessions(newSessions)
                              }}
                              className="admin-form-input text-sm"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <textarea
                              placeholder="Session Description"
                              rows={3}
                              value={session.description}
                              onChange={(e) => {
                                const newSessions = [...sessions]
                                newSessions[index].description = e.target.value
                                setSessions(newSessions)
                              }}
                              className="admin-form-textarea text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSessions(sessions.filter((_, i) => i !== index))}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Remove Session
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSessions([...sessions, { name: '', imageUrl: '', venueName: '', latitude: '', longitude: '', description: '' }])}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#5550B7] bg-[#5550B7]/10 rounded-lg hover:bg-[#5550B7]/20 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Session
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section E: Post Event Details */}
          {currentStep === 5 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Section D: Post Event Details</h2>
              </div>

              <div className="space-y-8">
                {/* Post-Event Configuration Section */}
                <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-[#5550B7] rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Post-Event Configuration</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="admin-form-group mb-0">
                        <label className="admin-form-label">Background Banner Image URL</label>
                        <input
                          type="url"
                          value={formData.postBackgroundBannerImageUrl}
                          onChange={(e) => updateFormData('postBackgroundBannerImageUrl', e.target.value)}
                          className="admin-form-input"
                          placeholder="https://example.com/banner.jpg"
                        />
                      </div>

                      <div className="admin-form-group mb-0">
                        <label className="admin-form-label">Banner Text Color</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={formData.postBannerTextColor}
                            onChange={(e) => updateFormData('postBannerTextColor', e.target.value)}
                            className="w-16 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm hover:border-[#5550B7] transition-colors"
                          />
                          <input
                            type="text"
                            value={formData.postBannerTextColor}
                            onChange={(e) => updateFormData('postBannerTextColor', e.target.value)}
                            className="admin-form-input flex-1"
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="admin-form-group mb-0">
                      <label className="admin-form-label">Welcome Text</label>
                      <textarea
                        rows={4}
                        value={formData.postWelcomeText}
                        onChange={(e) => updateFormData('postWelcomeText', e.target.value)}
                        className="admin-form-textarea"
                        placeholder="Enter a welcoming message for post-event..."
                      />
                    </div>
                  </div>
                </div>

                {/* Event Days */}
                <div className="border-t-2 border-gray-200 pt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#5550B7]/10">
                      <svg className="w-5 h-5 text-[#5550B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">List of Total Days</h3>
                  </div>
                  <div className="space-y-4">
                    {eventDays.map((day, index) => (
                      <div key={index} className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-lg bg-white hover:border-[#5550B7]/30 hover:shadow-md transition-all">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="date"
                            value={day.date}
                            onChange={(e) => {
                              const newDays = [...eventDays]
                              newDays[index].date = e.target.value
                              setEventDays(newDays)
                            }}
                            className="admin-form-input text-sm"
                          />
                          <input
                            type="url"
                            placeholder="Image URL"
                            value={day.imageUrl}
                            onChange={(e) => {
                              const newDays = [...eventDays]
                              newDays[index].imageUrl = e.target.value
                              setEventDays(newDays)
                            }}
                            className="admin-form-input text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Description"
                            value={day.description}
                            onChange={(e) => {
                              const newDays = [...eventDays]
                              newDays[index].description = e.target.value
                              setEventDays(newDays)
                            }}
                            className="admin-form-input text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setEventDays(eventDays.filter((_, i) => i !== index))}
                          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEventDays([...eventDays, { date: '', imageUrl: '', description: '' }])}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#5550B7] bg-[#5550B7]/10 rounded-lg hover:bg-[#5550B7]/20 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Day
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="admin-btn-secondary"
            >
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5550B7] hover:bg-[#4540A7]"
              >
                Next
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5550B7] hover:bg-[#4540A7] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Event')}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
