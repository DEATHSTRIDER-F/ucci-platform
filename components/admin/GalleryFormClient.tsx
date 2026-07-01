'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { compressImage, validateImageFile } from '@/lib/utils/imageCompressor'
import { createGalleryPost } from '@/app/actions/gallery'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2, CheckCircle, Plus } from 'lucide-react'

interface GalleryFormClientProps {
  areas: Array<{ id: string; name: string; chapters: Array<{ id: string; name: string }> }>
  adminProfile: { id: string; role: string; chapter_id: string | null }
}

interface ImageItem {
  file: File
  preview: string
  alt_text: string
}

export function GalleryFormClient({ areas, adminProfile }: GalleryFormClientProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [areaId, setAreaId] = useState('')
  const [chapterId, setChapterId] = useState(adminProfile.chapter_id ?? '')
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const selectedArea = areas.find(a => a.id === areaId)

  const handleImageAdd = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    for (const file of files) {
      const validation = validateImageFile(file)
      if (!validation.valid) { setErrors(er => ({ ...er, images: validation.error! })); continue }
      try {
        const compressed = await compressImage(file, { maxSizeKB: 500 })
        const preview = URL.createObjectURL(compressed)
        setImages(imgs => [...imgs, { file: compressed, preview, alt_text: '' }])
      } catch {
        setErrors(er => ({ ...er, images: 'Failed to process one or more images.' }))
      }
    }
    // Reset input so same file can be re-added
    e.target.value = ''
  }, [])

  const removeImage = (idx: number) => {
    setImages(imgs => imgs.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = 'Title is required'
    if (images.length === 0) e.images = 'At least one image is required'
    if (images.some(img => !img.alt_text.trim())) e.images = 'All images must have alt text'
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)

    try {
      // Convert images to base64
      const imageData = await Promise.all(
        images.map(async (img, idx) => {
          const b64: string = await new Promise((res, rej) => {
            const reader = new FileReader()
            reader.onload = () => res(reader.result as string)
            reader.onerror = rej
            reader.readAsDataURL(img.file)
          })
          return { b64, alt_text: img.alt_text, display_order: idx }
        })
      )

      const result = await createGalleryPost({
        title: title.trim(),
        content: content.trim() || null,
        area_id: areaId || null,
        chapter_id: chapterId || null,
        created_by: adminProfile.id,
        images: imageData,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => router.push('/gallery'), 2000)
      } else {
        setErrors({ submit: result.error ?? 'Failed to create post.' })
      }
    } catch {
      setErrors({ submit: 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="glass-card p-10 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <h2 className="font-display text-xl font-bold text-brand-white">Gallery Post Created!</h2>
        <p className="text-brand-silver mt-2">Redirecting to gallery...</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-8 space-y-6 max-w-3xl">
      <div>
        <label htmlFor="gallery_title" className="block text-brand-silver text-sm font-medium mb-1">Post Title *</label>
        <input id="gallery_title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="UCCI Pune East Chapter Monthly Meeting — June 2026" />
        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="gallery_content" className="block text-brand-silver text-sm font-medium mb-1">Description <span className="text-brand-silver/50">(optional)</span></label>
        <textarea id="gallery_content" value={content} onChange={e => setContent(e.target.value)} className="input-field min-h-[100px] resize-none" placeholder="Monthly chapter meeting where members exchanged referrals and updates..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="gallery_area" className="block text-brand-silver text-sm font-medium mb-1">Area <span className="text-brand-silver/50">(optional)</span></label>
          <select id="gallery_area" value={areaId} onChange={e => { setAreaId(e.target.value); setChapterId('') }} className="input-field">
            <option value="">All Areas</option>
            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="gallery_chapter" className="block text-brand-silver text-sm font-medium mb-1">Chapter <span className="text-brand-silver/50">(optional)</span></label>
          <select id="gallery_chapter" value={chapterId} onChange={e => setChapterId(e.target.value)} className="input-field" disabled={adminProfile.role === 'chapter_admin'}>
            <option value="">All Chapters</option>
            {(selectedArea?.chapters ?? areas.flatMap(a => a.chapters)).map(ch => (
              <option key={ch.id} value={ch.id}>{ch.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-brand-silver text-sm font-medium mb-2">Images * <span className="text-brand-silver/50">(auto-compressed to WebP/500KB)</span></label>
        <label htmlFor="gallery_images" className="btn-outline text-sm py-2 px-4 cursor-pointer inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Images
        </label>
        <input id="gallery_images" type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
        {errors.images && <p className="text-red-400 text-xs mt-1">{errors.images}</p>}

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative group">
                <div className="relative aspect-video rounded-lg overflow-hidden border border-brand-gold/20">
                  <Image src={img.preview} alt={img.alt_text || `Image ${idx + 1}`} fill className="object-cover" />
                </div>
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
                <input
                  type="text"
                  value={img.alt_text}
                  onChange={e => setImages(imgs => imgs.map((im, i) => i === idx ? { ...im, alt_text: e.target.value } : im))}
                  className="input-field text-xs mt-1 py-1.5"
                  placeholder="Alt text for this image *"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}

      <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Post...</> : 'Create Gallery Post'}
      </button>
    </div>
  )
}
