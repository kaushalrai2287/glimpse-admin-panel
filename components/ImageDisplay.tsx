'use client'

import { useState } from 'react'

interface ImageDisplayProps {
  src: string
  alt?: string
  className?: string
  fallback?: string
}

export default function ImageDisplay({ src, alt = '', className = '', fallback }: ImageDisplayProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [error, setError] = useState(false)

  // If it's an external URL, use it directly
  // If it's a local asset path, use it directly (Next.js serves from public folder)
  const getImageUrl = () => {
    if (!imgSrc) return fallback || '/placeholder-image.png'
    
    // External URL - use directly
    if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) {
      return imgSrc
    }
    
    // Local asset path - Next.js serves files from public folder directly
    // /assets/images/... will be served from public/assets/images/...
    if (imgSrc.startsWith('/assets/images/')) {
      return imgSrc
    }
    
    // If it doesn't start with /, assume it's a relative asset path
    if (!imgSrc.startsWith('/')) {
      return `/assets/images/${imgSrc}`
    }
    
    return imgSrc
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', {
      originalSrc: imgSrc,
      attemptedUrl: getImageUrl(),
    })
    setError(true)
    if (fallback) {
      setImgSrc(fallback)
    }
  }

  if (error && !fallback) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Image not found</span>
      </div>
    )
  }

  return (
    <img
      src={getImageUrl()}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={() => setError(false)}
    />
  )
}
