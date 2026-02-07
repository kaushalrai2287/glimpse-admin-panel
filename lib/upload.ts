import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export type ImageCategory =
  | 'venues/bg'
  | 'venues/facilities'
  | 'venues/contacts'
  | 'venues/photos'
  | 'events/splash'
  | 'events/banners'
  | 'events/intro'
  | 'events/explore'
  | 'events/happening'
  | 'events/sessions'
  | 'events/days'
  | 'profiles'

/**
 * Upload an image file and return the public URL path
 * @param file - File object from FormData
 * @param category - Category/folder for the image
 * @param filename - Optional custom filename (without extension)
 * @returns Public URL path relative to /assets/images/
 */
export async function uploadImage(
  file: File,
  category: ImageCategory,
  filename?: string
): Promise<string> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  // Get file extension
  const ext = file.name.split('.').pop() || 'jpg'
  const validExts = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  if (!validExts.includes(ext.toLowerCase())) {
    throw new Error(`Invalid image format. Allowed: ${validExts.join(', ')}`)
  }

  // Generate filename
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const finalFilename = filename
    ? `${filename}-${timestamp}.${ext}`
    : `${timestamp}-${randomStr}.${ext}`

  // Build file path - Next.js serves static files from public folder
  const categoryParts = category.split('/')
  const uploadDir = join(process.cwd(), 'public', 'assets', 'images', ...categoryParts)
  const filePath = join(uploadDir, finalFilename)

  // Ensure directory exists
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  // Convert File to Buffer and write
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  await writeFile(filePath, buffer)

  // Return public URL path (Next.js serves files from public folder directly)
  return `/assets/images/${category}/${finalFilename}`
}

/**
 * Delete an image file
 * @param imagePath - Path from database (e.g., /assets/images/venues/photos/123.jpg)
 */
export async function deleteImage(imagePath: string): Promise<void> {
  if (!imagePath.startsWith('/assets/images/')) {
    // External URL, skip deletion
    return
  }

  const { unlink } = await import('fs/promises')
  // Remove leading slash and prepend 'public' since files are in public folder
  const relativePath = imagePath.replace(/^\//, '')
  const filePath = join(process.cwd(), 'public', relativePath)
  
  try {
    await unlink(filePath)
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      // File doesn't exist, that's okay
      throw error
    }
  }
}
