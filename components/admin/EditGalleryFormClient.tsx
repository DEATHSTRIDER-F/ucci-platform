'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { compressImage, validateImageFile } from '@/lib/utils/imageCompressor'
import { updateGalleryPost } from '@/app/actions/gallery'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2, CheckCircle, Plus } from 'lucide-react'

interface EditGalleryFormClientProps {
  post: {
    id: string
    title: string
    content: string | null
    area_id: string | null
    chapter_id: string | null
    images: Array<{
      id: string
      image_url: string
      alt_text: string
      display_order: number
    }>
  }
  areas: Array<{ id: string; name: string; chapters: Array<{ id: string; name: string }> }>
  adminProfile: { id: string; role: string; chapter_id: string | null }
}

interface ImageItem {
  id?: string
  file?: File
  preview: string
  alt_text: string
  display_order: number
}

export function EditGalleryFormClient({ post, areas, adminProfile }: EditGalleryFormClientProps) {
  const router = useRouter()
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content || '')
  const [areaId, setAreaId] = useState(post.area_id || '')
  const [chapterId, setChapterId] = useState(post.chapter_id || '')
  
  // Initialize with existing images
  const initialImages: ImageItem[] = [...post.images]
    .sort((a, b) => a.display_order - b.display_order)
    .map(img => ({
      id: img.id,
      preview: img.image_url,
      alt_text: img.alt_text,
      display_order: img.display_order
    }))

  const [images, setImages] = useState<ImageItem[]>(initialImages)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const selectedArea = areas.find(a => a.id === areaId)

  const handleImageAdd = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    let currentMaxOrder = images.reduce((max, img) => Math.max(max, img.display_order), -1)
    
    for (const file of files) {
      const validation = validateImageFile(file)
      if (!validation.valid) { setErrors(er => ({ ...er, images: validation.error! })); continue }
      try {
        const compressed = await compressImage(file, { maxSizeKB: 500 })
        const preview = URL.createObjectURL(compressed)
        currentMaxOrder++
        setImages(imgs => [...imgs, { file: compressed, preview, alt_text: '', display_order: currentMaxOrder }])
      } catch {
        setErrors(er => ({ ...er, images: 'Failed to process one or more images.' }))
      }
    }
    e.target.value = ''
  }, [images])

  const removeImage = (idx: number) => {
    setImages(imgs => imgs.filter((_, i) => i !== idx))
  }

  const moveImage = (idx: number, direction: -1 | 1) => {
    if (idx + direction < 0 || idx + direction >= images.length) return
    const newImages = [...images]
    const temp = newImages[idx]
    newImages[idx] = newImages[idx + direction]
    newImages[idx + direction] = temp
    
    // Update display orders
    newImages.forEach((img, i) => { img.display_order = i })
    setImages(newImages)
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
      const imageData = await Promise.all(
        images.map(async (img) => {
          let b64: string | undefined
          if (img.file) {
            b64 = await new Promise((res, rej) => {
              const reader = new FileReader()
              reader.onload = () => res(reader.result as string)
              reader.onerror = rej
              reader.readAsDataURL(img.file!)
            })
          }
          return { id: img.id, b64, alt_text: img.alt_text, display_order: img.display_order }
        })
      )

      const result = await updateGalleryPost(post.id, {
        title: title.trim(),
        content: content.trim() || null,
        area_id: areaId || null,
        chapter_id: chapterId || null,
        images: imageData,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => router.push('/admin/gallery'), 2000)
      } else {
        setErrors({ submit: result.error ?? 'Failed to update post.' })
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
        <h2 className="font-display text-xl font-bold text-brand-white">Gallery Post Updated!</h2>
        <p className="text-brand-silver mt-2">Redirecting to gallery manager...</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-8 space-y-6 max-w-3xl">
      <div>
        <label htmlFor="gallery_title" className="block text-brand-silver text-sm font-medium mb-1">Post Title *</label>
        <input id="gallery_title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="UCCI Pune East Chapter Monthly Meeting" />
        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="gallery_content" className="block text-brand-silver text-sm font-medium mb-1">Description <span className="text-brand-silver/50">(optional)</span></label>
        <textarea id="gallery_content" value={content} onChange={e => setContent(e.target.value)} className="input-field min-h-[100px] resize-none" placeholder="Monthly chapter meeting details..." />
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
        <div className="flex justify-between items-center mb-2">
          <label className="block text-brand-silver text-sm font-medium">Images *</label>
          <label htmlFor="gallery_images" className="btn-outline text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add More
          </label>
        </div>
        <input id="gallery_images" type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
        {errors.images && <p className="text-red-400 text-xs mt-1">{errors.images}</p>}

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative group bg-brand-navy/30 p-2 rounded-lg border border-brand-gold/10">
                <div className="relative aspect-video rounded overflow-hidden mb-2">
                  <Image src={img.preview} alt={img.alt_text || `Image ${idx + 1}`} fill className="object-cover" unoptimized={!img.file} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => moveImage(idx, -1)} 
                      disabled={idx === 0}
                      className="p-1 bg-brand-navy/80 rounded text-brand-white hover:text-brand-gold disabled:opacity-30"
                    >
                      &larr;
                    </button>
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)}
                      className="p-1 bg-red-500/80 rounded text-brand-white hover:bg-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => moveImage(idx, 1)} 
                      disabled={idx === images.length - 1}
                      className="p-1 bg-brand-navy/80 rounded text-brand-white hover:text-brand-gold disabled:opacity-30"
                    >
                      &rarr;
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={img.alt_text}
                  onChange={e => setImages(imgs => imgs.map((im, i) => i === idx ? { ...im, alt_text: e.target.value } : im))}
                  className="input-field text-xs py-1.5"
                  placeholder="Alt text *"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}

      <div className="flex gap-3">
        <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 flex justify-center items-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
        </button>
        <button onClick={() => router.push('/admin/gallery')} disabled={loading} className="btn-outline px-6">
          Cancel
        </button>
      </div>
    </div>
  )
}