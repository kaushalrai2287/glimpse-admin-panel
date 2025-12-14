'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import type { Admin } from '@/lib/types'

export default function CreateAdminPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    role: 'event_admin' as 'super_admin' | 'event_admin',
  })

  useEffect(() => {
    fetchAdmin()
  }, [])

  const fetchAdmin = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (!response.ok || data.admin.role !== 'super_admin') {
        router.push('/dashboard')
        return
      }

      setAdmin(data.admin)
    } catch (error) {
      console.error('Fetch admin error:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)

    // Validation
    if (!formData.email || !formData.password || !formData.name) {
      setError('All fields are required')
      setSubmitting(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setSubmitting(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/admins/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create admin')
        setSubmitting(false)
        return
      }

      setSuccess(true)
      setFormData({
        email: '',
        password: '',
        name: '',
        confirmPassword: '',
        role: 'event_admin',
      })

      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Create admin error:', error)
      setError('An error occurred while creating the admin')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#5550B7] hover:text-[#4540A7] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Create Admin</h1>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm font-medium text-green-800">
                Admin created successfully!
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm font-medium text-red-800">{error}</div>
            </div>
          )}

          {/* Form Card */}
          <div className="admin-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="bg-gradient-to-br from-[#5550B7]/5 to-[#5550B7]/10 rounded-xl p-6 border border-[#5550B7]/20">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-6 bg-[#5550B7] rounded-full"></div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Basic Information</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="name" className="admin-form-label">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      placeholder="Enter admin name"
                      className="admin-form-input"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="admin-form-label">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      placeholder="Enter email address"
                      className="admin-form-input"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="admin-form-label">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      required
                      className="admin-form-select"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as 'super_admin' | 'event_admin',
                        })
                      }
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
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Security</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="password" className="admin-form-label">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      className="admin-form-input"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="admin-form-label">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      required
                      minLength={6}
                      placeholder="Re-enter password"
                      className="admin-form-input"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 0 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Create Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

