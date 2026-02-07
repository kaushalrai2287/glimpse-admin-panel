export type AdminRole = 'super_admin' | 'event_admin'

export interface Admin {
  id: string
  email: string
  name: string
  role: AdminRole
  created_at: string
  updated_at: string
}

export interface EventCategory {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Venue {
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

export interface VenueFacility {
  id: string
  venue_id: string
  name: string
  image_url?: string
  created_at: string
}

export interface VenueContact {
  id: string
  venue_id: string
  name: string
  image_url?: string
  phone_number?: string
  email?: string
  created_at: string
}

export interface VenuePhoto {
  id: string
  venue_id: string
  image_url: string
  alt_text?: string
  sort_order: number
  created_at: string
}

export interface VenueWithDetails extends Venue {
  facilities?: VenueFacility[]
  contacts?: VenueContact[]
  photos?: VenuePhoto[]
}

export interface Event {
  id: string
  event_id: string
  name: string
  description?: string
  category_id?: string
  venue_id?: string
  login_code: string
  created_by?: string
  start_date?: string
  end_date?: string
  status: 'active' | 'inactive' | 'completed'
  is_enabled: boolean
  // Event styling
  splash_image_url?: string
  primary_color?: string
  secondary_color?: string
  // Pre-event content
  background_banner_image_url?: string
  banner_text_color?: string
  welcome_text?: string
  // During-event content
  during_background_banner_image_url?: string
  during_banner_text_color?: string
  during_welcome_text?: string
  // Post-event content
  post_background_banner_image_url?: string
  post_banner_text_color?: string
  post_welcome_text?: string
  created_at: string
  updated_at: string
}

export interface AdminEvent {
  id: string
  admin_id: string
  event_id: string
  created_at: string
}

export interface PreEventExplore {
  id: string
  event_id: string
  name: string
  image_url: string
  sort_order: number
  created_at: string
}

export interface PreEventHappening {
  id: string
  event_id: string
  image_url: string
  alt_text?: string
  sort_order: number
  created_at: string
}

export interface EventIntro {
  id: string
  event_id: string
  title: string
  description?: string
  image_url: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface EventSession {
  id: string
  event_id: string
  name: string
  description?: string
  image_url?: string
  venue_name?: string
  latitude?: number
  longitude?: number
  start_time?: string
  end_time?: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface EventDay {
  id: string
  event_id: string
  date: string
  image_url?: string
  description?: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface DuringEventContent {
  id: string
  event_id: string
  content_type: string
  title?: string
  content?: string
  media_url?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PostEventContent {
  id: string
  event_id: string
  content_type: string
  title?: string
  content?: string
  media_url?: string
  sort_order: number
  created_at: string
}

export interface EventWithAssignedAdmins extends Event {
  assigned_admins?: Admin[]
  category?: EventCategory
  venue?: VenueWithDetails
  event_intro?: EventIntro[]
  pre_event_explore?: PreEventExplore[]
  pre_event_happening?: PreEventHappening[]
  event_sessions?: EventSession[]
  event_days?: EventDay[]
  during_event_content?: DuringEventContent[]
  post_event_content?: PostEventContent[]
}

