import { supabase } from './supabase/client'
import type {
  EventIntro,
  PreEventExplore,
  PreEventHappening,
  DuringEventContent,
  PostEventContent
} from './types'

// Event intro content
export async function getEventIntro(eventId: string): Promise<EventIntro[]> {
  try {
    const { data: intro, error } = await supabase
      .from('event_intro')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Get event intro error:', error)
      return []
    }

    return intro as EventIntro[]
  } catch (error) {
    console.error('Get event intro error:', error)
    return []
  }
}

export async function addEventIntro(
  eventId: string,
  title: string,
  imageUrl: string,
  options: {
    description?: string
    sortOrder?: number
  } = {}
): Promise<EventIntro | null> {
  try {
    const { data: intro, error } = await supabase
      .from('event_intro')
      .insert({
        event_id: eventId,
        title,
        description: options.description,
        image_url: imageUrl,
        sort_order: options.sortOrder || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Add event intro error:', error)
      return null
    }

    return intro as EventIntro
  } catch (error) {
    console.error('Add event intro error:', error)
    return null
  }
}

export async function removeEventIntro(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('event_intro')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Remove event intro error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Remove event intro error:', error)
    return false
  }
}

// Pre-event explore content
export async function getPreEventExplore(eventId: string): Promise<PreEventExplore[]> {
  try {
    const { data: explore, error } = await supabase
      .from('pre_event_explore')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Get pre-event explore error:', error)
      return []
    }

    return explore as PreEventExplore[]
  } catch (error) {
    console.error('Get pre-event explore error:', error)
    return []
  }
}

export async function addPreEventExplore(
  eventId: string,
  name: string,
  imageUrl: string,
  sortOrder: number = 0
): Promise<PreEventExplore | null> {
  try {
    const { data: explore, error } = await supabase
      .from('pre_event_explore')
      .insert({
        event_id: eventId,
        name,
        image_url: imageUrl,
        sort_order: sortOrder,
      })
      .select()
      .single()

    if (error) {
      console.error('Add pre-event explore error:', error)
      return null
    }

    return explore as PreEventExplore
  } catch (error) {
    console.error('Add pre-event explore error:', error)
    return null
  }
}

export async function removePreEventExplore(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('pre_event_explore')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Remove pre-event explore error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Remove pre-event explore error:', error)
    return false
  }
}

// Pre-event happening content
export async function getPreEventHappening(eventId: string): Promise<PreEventHappening[]> {
  try {
    const { data: happening, error } = await supabase
      .from('pre_event_happening')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Get pre-event happening error:', error)
      return []
    }

    return happening as PreEventHappening[]
  } catch (error) {
    console.error('Get pre-event happening error:', error)
    return []
  }
}

export async function addPreEventHappening(
  eventId: string,
  imageUrl: string,
  options: {
    altText?: string
    sortOrder?: number
  } = {}
): Promise<PreEventHappening | null> {
  try {
    const { data: happening, error } = await supabase
      .from('pre_event_happening')
      .insert({
        event_id: eventId,
        image_url: imageUrl,
        alt_text: options.altText,
        sort_order: options.sortOrder || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Add pre-event happening error:', error)
      return null
    }

    return happening as PreEventHappening
  } catch (error) {
    console.error('Add pre-event happening error:', error)
    return null
  }
}

export async function removePreEventHappening(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('pre_event_happening')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Remove pre-event happening error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Remove pre-event happening error:', error)
    return false
  }
}

// During event content (placeholder for future implementation)
export async function getDuringEventContent(eventId: string): Promise<DuringEventContent[]> {
  try {
    const { data: content, error } = await supabase
      .from('during_event_content')
      .select('*')
      .eq('event_id', eventId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Get during event content error:', error)
      return []
    }

    return content as DuringEventContent[]
  } catch (error) {
    console.error('Get during event content error:', error)
    return []
  }
}

export async function addDuringEventContent(
  eventId: string,
  contentType: string,
  options: {
    title?: string
    content?: string
    mediaUrl?: string
    isActive?: boolean
    sortOrder?: number
  } = {}
): Promise<DuringEventContent | null> {
  try {
    const { data: content, error } = await supabase
      .from('during_event_content')
      .insert({
        event_id: eventId,
        content_type: contentType,
        title: options.title,
        content: options.content,
        media_url: options.mediaUrl,
        is_active: options.isActive !== false,
        sort_order: options.sortOrder || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Add during event content error:', error)
      return null
    }

    return content as DuringEventContent
  } catch (error) {
    console.error('Add during event content error:', error)
    return null
  }
}

// Post event content (placeholder for future implementation)
export async function getPostEventContent(eventId: string): Promise<PostEventContent[]> {
  try {
    const { data: content, error } = await supabase
      .from('post_event_content')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Get post event content error:', error)
      return []
    }

    return content as PostEventContent[]
  } catch (error) {
    console.error('Get post event content error:', error)
    return []
  }
}

export async function addPostEventContent(
  eventId: string,
  contentType: string,
  options: {
    title?: string
    content?: string
    mediaUrl?: string
    sortOrder?: number
  } = {}
): Promise<PostEventContent | null> {
  try {
    const { data: content, error } = await supabase
      .from('post_event_content')
      .insert({
        event_id: eventId,
        content_type: contentType,
        title: options.title,
        content: options.content,
        media_url: options.mediaUrl,
        sort_order: options.sortOrder || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Add post event content error:', error)
      return null
    }

    return content as PostEventContent
  } catch (error) {
    console.error('Add post event content error:', error)
    return null
  }
}