'use client'

import { useState, useRef, useEffect } from 'react'

interface ImageUploadProps {
  label: string
  name: string
  category: 'venues/bg' | 'venues/facilities' | 'venues/contacts' | 'venues/photos' | 'events/splash' | 'events/banners' | 'events/intro' | 'events/explore' | 'events/happening' | 'events/sessions' | 'events/days' | 'profiles'
  value?: string
  onChange?: (imageUrl: string) => void
  required?: boolean
  accept?: string
  className?: string
}

export default function ImageUpload({
  label,
  name,
  category,
  value,
  onChange,
  required = false,
  accept = 'image/*',
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [uploadedUrl, setUploadedUrl] = useState<string>(value || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show temporary preview while uploading
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (!data.imageUrl) {
        throw new Error('No image URL returned from server')
      }
      const imageUrl = data.imageUrl
      
      // Update state with uploaded URL (not data URL)
      setUploadedUrl(imageUrl)
      setPreview(imageUrl) // Use uploaded URL for preview
      
      // Update hidden input directly
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = imageUrl
      }
      
      if (onChange) {
        onChange(imageUrl)
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      const errorMessage = error?.message || 'Failed to upload image. Please try again.'
      alert(errorMessage)
      setPreview(null)
      setUploadedUrl('')
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = ''
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setUploadedUrl('')
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = ''
    }
    if (onChange) {
      onChange('')
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    setPreview(value || null)
    setUploadedUrl(value || '')
  }, [value])

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
            onError={(e) => {
              console.error('Image load error:', preview)
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#5550B7] transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            name={name}
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            required={required}
            className="hidden"
            id={`file-upload-${name}`}
          />
          <label
            htmlFor={`file-upload-${name}`}
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5550B7]"></div>
                <span className="text-sm text-gray-600">Uploading...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, WEBP up to 10MB
                </span>
              </>
            )}
          </label>
        </div>
      )}
      
      {/* Hidden input to store the URL for form submission */}
      <input 
        ref={hiddenInputRef}
        type="hidden" 
        name={name} 
        value={uploadedUrl} 
        required={required}
        data-uploaded={uploadedUrl ? 'true' : 'false'}
      />
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mt-1">
          Uploaded URL: {uploadedUrl || 'Not set'}
        </div>
      )}
    </div>
  )
}
