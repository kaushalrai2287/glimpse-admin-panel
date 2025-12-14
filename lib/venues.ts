import { supabase } from './supabase/client'
import type { Venue, VenueWithDetails, VenueFacility, VenueContact, VenuePhoto } from './types'

export async function getAllVenues(): Promise<Venue[]> {
  try {
    const { data: venues, error } = await supabase
      .from('venues')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Get venues error:', error)
      return []
    }

    return venues as Venue[]
  } catch (error) {
    console.error('Get venues error:', error)
    return []
  }
}

export async function getVenueById(id: string): Promise<Venue | null> {
  try {
    const { data: venue, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !venue) {
      return null
    }

    return venue as Venue
  } catch (error) {
    console.error('Get venue error:', error)
    return null
  }
}

export async function getVenueWithDetails(id: string): Promise<VenueWithDetails | null> {
  try {
    const venue = await getVenueById(id)
    if (!venue) {
      return null
    }

    // Get facilities
    const { data: facilities, error: facilitiesError } = await supabase
      .from('venue_facilities')
      .select('*')
      .eq('venue_id', id)
      .order('name', { ascending: true })

    // Get contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('venue_contacts')
      .select('*')
      .eq('venue_id', id)
      .order('name', { ascending: true })

    // Get photos
    const { data: photos, error: photosError } = await supabase
      .from('venue_photos')
      .select('*')
      .eq('venue_id', id)
      .order('sort_order', { ascending: true })

    return {
      ...venue,
      facilities: facilitiesError ? [] : (facilities as VenueFacility[]),
      contacts: contactsError ? [] : (contacts as VenueContact[]),
      photos: photosError ? [] : (photos as VenuePhoto[]),
    }
  } catch (error) {
    console.error('Get venue with details error:', error)
    return null
  }
}

export async function createVenue(
  name: string,
  address: string,
  options: {
    description?: string
    bgImageUrl?: string
    latitude?: number
    longitude?: number
    city?: string
  } = {}
): Promise<Venue | null> {
  try {
    const { data: venue, error } = await supabase
      .from('venues')
      .insert({
        name,
        address,
        description: options.description,
        bg_image_url: options.bgImageUrl,
        latitude: options.latitude,
        longitude: options.longitude,
        city: options.city,
      })
      .select()
      .single()

    if (error) {
      console.error('Create venue error:', error)
      return null
    }

    return venue as Venue
  } catch (error) {
    console.error('Create venue error:', error)
    return null
  }
}

export async function updateVenue(id: string, updates: Partial<Venue>): Promise<Venue | null> {
  try {
    const { data: venue, error } = await supabase
      .from('venues')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update venue error:', error)
      return null
    }

    return venue as Venue
  } catch (error) {
    console.error('Update venue error:', error)
    return null
  }
}

export async function deleteVenue(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete venue error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete venue error:', error)
    return false
  }
}

// Venue Facilities
export async function addVenueFacility(venueId: string, name: string, imageUrl?: string): Promise<VenueFacility | null> {
  try {
    const { data: facility, error } = await supabase
      .from('venue_facilities')
      .insert({
        venue_id: venueId,
        name,
        image_url: imageUrl,
      })
      .select()
      .single()

    if (error) {
      console.error('Add venue facility error:', error)
      return null
    }

    return facility as VenueFacility
  } catch (error) {
    console.error('Add venue facility error:', error)
    return null
  }
}

export async function removeVenueFacility(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('venue_facilities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Remove venue facility error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Remove venue facility error:', error)
    return false
  }
}

// Venue Contacts
export async function addVenueContact(
  venueId: string,
  name: string,
  options: {
    imageUrl?: string
    phoneNumber?: string
    email?: string
  } = {}
): Promise<VenueContact | null> {
  try {
    const { data: contact, error } = await supabase
      .from('venue_contacts')
      .insert({
        venue_id: venueId,
        name,
        image_url: options.imageUrl,
        phone_number: options.phoneNumber,
        email: options.email,
      })
      .select()
      .single()

    if (error) {
      console.error('Add venue contact error:', error)
      return null
    }

    return contact as VenueContact
  } catch (error) {
    console.error('Add venue contact error:', error)
    return null
  }
}

export async function removeVenueContact(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('venue_contacts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Remove venue contact error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Remove venue contact error:', error)
    return false
  }
}

// Venue Photos
export async function addVenuePhoto(
  venueId: string,
  imageUrl: string,
  options: {
    altText?: string
    sortOrder?: number
  } = {}
): Promise<VenuePhoto | null> {
  try {
    const { data: photo, error } = await supabase
      .from('venue_photos')
      .insert({
        venue_id: venueId,
        image_url: imageUrl,
        alt_text: options.altText,
        sort_order: options.sortOrder || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Add venue photo error:', error)
      return null
    }

    return photo as VenuePhoto
  } catch (error) {
    console.error('Add venue photo error:', error)
    return null
  }
}

export async function removeVenuePhoto(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('venue_photos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Remove venue photo error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Remove venue photo error:', error)
    return false
  }
}