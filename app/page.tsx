import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getAllAdmins } from '@/lib/auth'

export default async function Home() {
  const cookieStore = cookies()
  const adminId = cookieStore.get('admin_id')?.value

  // Check if setup is needed (no admins exist)
  try {
    const admins = await getAllAdmins()
    if (admins.length === 0) {
      redirect('/setup')
    }
  } catch (error) {
    // If check fails, proceed normally
    console.error('Setup check failed:', error)
  }

  if (adminId) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
