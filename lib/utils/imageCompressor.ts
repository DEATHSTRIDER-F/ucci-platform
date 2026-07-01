/**
 * Image optimization utility — converts uploaded images to WebP format,
 * compresses to sub-500KB, and constrains dimensions to 1200px bounding box.
 *
 * Runs client-side using HTML5 Canvas before Supabase Storage upload.
 * All image upload/update operations should use upsert to avoid storage clutter.
 */

export interface CompressOptions {
  maxSizeKB?: number     // default: 500
  maxDimension?: number  // default: 1200
  quality?: number       // 0–1, default: 0.85 (auto-reduced if size exceeded)
}

/**
 * Compresses and converts an image File to WebP format.
 * Returns a new File object ready for Supabase Storage upsert.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxSizeKB = 500,
    maxDimension = 1200,
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl)

      // Compute scaled dimensions preserving aspect ratio
      let { width, height } = img
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context unavailable'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Iteratively reduce quality until size is within limit
      let quality = 0.85
      let blob: Blob | null = null

      while (quality >= 0.1) {
        blob = await canvasToBlob(canvas, 'image/webp', quality)
        if (blob && blob.size <= maxSizeKB * 1024) break
        quality -= 0.05
      }

      if (!blob) {
        reject(new Error('Image compression failed'))
        return
      }

      // Rename to .webp extension
      const originalName = file.name.replace(/\.[^/.]+$/, '')
      const webpFile = new File([blob], `${originalName}.webp`, {
        type: 'image/webp',
        lastModified: Date.now(),
      })

      resolve(webpFile)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }

    img.src = objectUrl
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality)
  })
}

/**
 * Validates that a file is an image type supported for upload.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WebP, or GIF images are allowed.' }
  }
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size must be under 10MB.' }
  }
  return { valid: true }
}

/**
 * Generates a unique storage path for upsert operations.
 * Using the same path for the same entity ensures upsert replaces the old file.
 */
export function getStoragePath(bucket: string, entityId: string, filename: string): string {
  const ext = filename.includes('.webp') ? 'webp' : 'webp'
  return `${bucket}/${entityId}.${ext}`
}
