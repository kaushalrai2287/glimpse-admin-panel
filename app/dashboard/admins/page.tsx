'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface Admin {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'event_admin'
  created_at: string
}

export default function AdminsPage() {
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<Admin | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [adminsRes, userRes] = await Promise.all([
        fetch('/api/admins'),
        fetch('/api/auth/me')
      ])

      if (adminsRes.ok) {
        const adminsData = await adminsRes.json()
        setAdmins(adminsData.admins)
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

  const handleDelete = async (adminId: string, adminName: string) => {
    if (!confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      return
    }

    setDeleteLoading(adminId)
    try {
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAdmins(prev => prev.filter(admin => admin.id !== adminId))
        alert('Admin deleted successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete admin')
      }
    } catch (error) {
      console.error('Delete admin error:', error)
      alert('Failed to delete admin')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleCreate = async (formData: FormData) => {
    try {
      const response = await fetch('/api/admins/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          name: formData.get('name'),
          role: formData.get('role')
        })
      })

      if (response.ok) {
        setShowCreateModal(false)
        fetchData() // Refresh the list
        alert('Admin created successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create admin')
      }
    } catch (error) {
      console.error('Create admin error:', error)
      alert('Failed to create admin')
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
            <h1 className="text-2xl font-semibold text-gray-900">Admins</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage admin users and their permissions.
            </p>
          </div>
          {isSuperAdmin && (
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                onClick={() => setShowCreateModal(true)}
                className="admin-btn-primary"
              >
                Create Admin
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Role
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Created
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {admins.map((admin) => (
                      <tr key={admin.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {admin.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {admin.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            admin.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {admin.role === 'super_admin' ? 'Super Admin' : 'Event Admin'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {isSuperAdmin && admin.id !== currentUser?.id && admin.role === 'event_admin' && (
                            <button
                              onClick={() => handleDelete(admin.id, admin.name)}
                              disabled={deleteLoading === admin.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deleteLoading === admin.id ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Create Admin Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowCreateModal(false)}>
            <div className="flex min-h-full items-center justify-center p-4">
              <div 
                className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-[#5550B7] to-[#4540A7] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        Create New Admin
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
                  {/* Basic Information Section */}
                  <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-1 h-6 bg-[#5550B7] rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Basic Information</h4>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="name" className="admin-form-label">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          placeholder="Enter admin name"
                          className="admin-form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="admin-form-label">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          placeholder="Enter email address"
                          className="admin-form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="role" className="admin-form-label">
                          Role <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="role"
                          id="role"
                          required
                          defaultValue="event_admin"
                          className="admin-form-select"
                        >
                          <option value="event_admin">Event Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                        <p className="mt-2 text-xs text-gray-500 flex items-start gap-2">
                          <svg className="w-4 h-4 text-[#5550B7] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Event Admin can only access assigned events. Super Admin can access all events and create events.</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-1 h-6 bg-[#5550B7] rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Security</h4>
                    </div>
                    <div>
                      <label htmlFor="password" className="admin-form-label">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        required
                        minLength={6}
                        placeholder="Minimum 6 characters"
                        className="admin-form-input"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Password must be at least 6 characters long
                      </p>
                    </div>
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
                      Create Admin
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