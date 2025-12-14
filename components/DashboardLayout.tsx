'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Admin {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'event_admin'
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdmin()
  }, [])

  const fetchAdmin = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (!response.ok) {
        router.push('/login')
        return
      }

      setAdmin(data.admin)
    } catch (error) {
      console.error('Fetch admin error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-[#5550B7]">
                  Glimpse
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-[#5550B7] text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Events
                </Link>
                {admin.role === 'super_admin' && (
                  <>
                    {/* <Link
                      href="/dashboard/events/create"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Create Event
                    </Link> */}
                    <Link
                      href="/dashboard/categories"
                      className="border-transparent text-gray-500 hover:text-[#5550B7] hover:border-[#5550B7] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                    >
                      Categories
                    </Link>
                    <Link
                      href="/dashboard/venues"
                      className="border-transparent text-gray-500 hover:text-[#5550B7] hover:border-[#5550B7] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                    >
                      Venues
                    </Link>
                    <Link
                      href="/dashboard/admins"
                      className="border-transparent text-gray-500 hover:text-[#5550B7] hover:border-[#5550B7] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                    >
                      Admins
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <div className="text-gray-900 font-medium">{admin.name}</div>
                      <div className="text-gray-500 text-xs">
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Event Admin'}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="admin-btn-primary"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

