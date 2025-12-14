import { supabase } from './supabase/client'
import type { EventCategory } from './types'

export async function getAllCategories(): Promise<EventCategory[]> {
  try {
    const { data: categories, error } = await supabase
      .from('event_categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Get categories error:', error)
      return []
    }

    return categories as EventCategory[]
  } catch (error) {
    console.error('Get categories error:', error)
    return []
  }
}

export async function getCategoryById(id: string): Promise<EventCategory | null> {
  try {
    const { data: category, error } = await supabase
      .from('event_categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !category) {
      return null
    }

    return category as EventCategory
  } catch (error) {
    console.error('Get category error:', error)
    return null
  }
}

export async function createCategory(name: string, description?: string): Promise<EventCategory | null> {
  try {
    const { data: category, error } = await supabase
      .from('event_categories')
      .insert({
        name,
        description,
      })
      .select()
      .single()

    if (error) {
      console.error('Create category error:', error)
      return null
    }

    return category as EventCategory
  } catch (error) {
    console.error('Create category error:', error)
    return null
  }
}

export async function updateCategory(id: string, updates: Partial<EventCategory>): Promise<EventCategory | null> {
  try {
    const { data: category, error } = await supabase
      .from('event_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update category error:', error)
      return null
    }

    return category as EventCategory
  } catch (error) {
    console.error('Update category error:', error)
    return null
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('event_categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete category error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete category error:', error)
    return false
  }
}