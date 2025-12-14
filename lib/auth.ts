import bcrypt from 'bcryptjs'
import { supabase } from './supabase/client'
import type { Admin, AdminRole } from './types'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function loginAdmin(email: string, password: string): Promise<Admin | null> {
  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !admin) {
      return null
    }

    const isValid = await verifyPassword(password, admin.password_hash)
    if (!isValid) {
      return null
    }

    // Remove password_hash from response
    const { password_hash, ...adminWithoutPassword } = admin
    return adminWithoutPassword as Admin
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

export async function createAdmin(
  email: string,
  password: string,
  name: string,
  role: AdminRole = 'event_admin'
): Promise<Admin | null> {
  try {
    const passwordHash = await hashPassword(password)
    
    const { data: admin, error } = await supabase
      .from('admins')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        role,
      })
      .select()
      .single()

    if (error) {
      console.error('Create admin error:', error)
      return null
    }

    const { password_hash, ...adminWithoutPassword } = admin
    return adminWithoutPassword as Admin
  } catch (error) {
    console.error('Create admin error:', error)
    return null
  }
}

export async function getAdminById(id: string): Promise<Admin | null> {
  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !admin) {
      return null
    }

    const { password_hash, ...adminWithoutPassword } = admin
    return adminWithoutPassword as Admin
  } catch (error) {
    console.error('Get admin error:', error)
    return null
  }
}

export async function getAllAdmins(): Promise<Admin[]> {
  try {
    const { data: admins, error } = await supabase
      .from('admins')
      .select('id, email, name, role, created_at, updated_at')

    if (error) {
      console.error('Get admins error:', error)
      return []
    }

    return admins as Admin[]
  } catch (error) {
    console.error('Get admins error:', error)
    return []
  }
}

export async function deleteAdmin(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete admin error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete admin error:', error)
    return false
  }
}

