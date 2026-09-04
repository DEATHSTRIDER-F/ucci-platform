'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { compressImage, validateImageFile } from '@/lib/utils/imageCompressor'
import {
  createSlide, updateSlide, deleteSlide, toggleSlideActive,
} from '@/app/actions/slides'
import { Plus, Trash2, Loader2, Upload, Eye, EyeOff, GripVertical, Edit2, X, Check } from 'lucide-react'
import type { HeroSlide } from '@/lib/types/database'

interface SlidesManagerClientProps {
  slides: HeroSlide[]
  adminId: string
}

interface SlideFormState {
  title: string
  subtitle: string
  alt_text: string
  cta_text: string
  cta_url: string
  display_order: number
  is_active: boolean
}

const defaultForm: SlideFormState = {
  title: '', subtitle: '', alt_text: '', cta_text: '', cta_url: '',
  display_order: 0, is_active: true,
}

// ─── SlideForm extracted OUTSIDE parent to prevent remount on every keystroke ──
interface SlideFormProps {
  isNew: boolean
  slideId?: string
  form: SlideFormState
  setForm: React.Dispatch<React.SetStateAction<SlideFormState>>
  imageFile: File | null
  imagePreview: string | null
  imageError: string
  mobileImageFile: File | null
  mobileImagePreview: string | null
  mobileImageError: string
  mobileRemoved: boolean
  errors: Record<string, string>
  loading: string | null
  currentImageUrl?: string
  currentMobileImageUrl?: string | null
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onMobileImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveMobile: () => void
  onSave: () => void
  onCancel: () => void
}

function SlideForm({
  isNew, slideId, form, setForm, imageFile, imagePreview, imageError,
  mobileImageFile, mobileImagePreview, mobileImageError, mobileRemoved,
  errors, loading, currentImageUrl, currentMobileImageUrl, onImageSelect, onMobileImageSelect, onRemoveMobile, onSave, onCancel,
}: SlideFormProps) {
  const showMobileCurrent = !isNew && currentMobileImageUrl && !mobileImagePreview && !mobileRemoved
  return (
    <div className="glass-card p-6 space-y-4 border-brand-gold/40">
      <h3 className="font-display font-semibold text-brand-white">{isNew ? 'New Slide' : 'Edit Slide'}</h3>

      {/* Desktop / PC Image Upload */}
      <div>
        <label className="block text-brand-silver text-sm font-medium mb-2">
          Desktop / PC Image {isNew ? '*' : '(leave blank to keep existing)'} <span className="text-brand-silver/50">(landscape, shown on md screens and up)</span>
        </label>
        <div className="flex items-start gap-4">
          {imagePreview ? (
            <div className="relative w-32 h-20 rounded-lg overflow-hidden border-2 border-brand-gold/40 flex-shrink-0">
              <Image src={imagePreview} alt="Desktop preview" fill className="object-cover" />
            </div>
          ) : !isNew && currentImageUrl ? (
            <div className="relative w-32 h-20 rounded-lg overflow-hidden border-2 border-brand-sapphire flex-shrink-0">
              <Image src={currentImageUrl} alt="Current desktop" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-brand-navy/40 flex items-center justify-center text-xs text-brand-silver">Current</div>
            </div>
          ) : null}
          <div>
            <label htmlFor={isNew ? 'slide_img_new' : `slide_img_${slideId}`} className="btn-outline text-sm py-2 px-4 cursor-pointer inline-flex items-center gap-2">
              <Upload className="w-4 h-4" /> {imageFile ? 'Change Desktop Image' : 'Upload Desktop Image'}
            </label>
            <input
              id={isNew ? 'slide_img_new' : `slide_img_${slideId}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageSelect}
            />
            <p className="text-brand-silver/60 text-xs mt-1">Auto-converted to WebP · Max 500KB</p>
            {imageError && <p className="text-red-400 text-xs mt-1">{imageError}</p>}
            {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
          </div>
        </div>
      </div>

      {/* Mobile Image Upload */}
      <div>
        <label className="block text-brand-silver text-sm font-medium mb-2">
          Mobile Image <span className="text-brand-silver/50">(optional, portrait recommended, shown below md breakpoint. Falls back to desktop if empty.)</span>
        </label>
        <div className="flex items-start gap-4">
          {mobileImagePreview ? (
            <div className="relative w-16 h-24 rounded-lg overflow-hidden border-2 border-brand-gold/40 flex-shrink-0">
              <Image src={mobileImagePreview} alt="Mobile preview" fill className="object-cover" />
            </div>
          ) : showMobileCurrent ? (
            <div className="relative w-16 h-24 rounded-lg overflow-hidden border-2 border-brand-sapphire flex-shrink-0">
              <Image src={currentMobileImageUrl!} alt="Current mobile" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-brand-navy/40 flex items-center justify-center text-[10px] text-brand-silver">Current</div>
            </div>
          ) : (
            <div className="w-16 h-24 rounded-lg border border-dashed border-brand-silver/20 flex items-center justify-center text-[10px] text-brand-silver/50 text-center px-1 flex-shrink-0">
              No mobile image
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <label htmlFor={isNew ? 'slide_img_mobile_new' : `slide_img_mobile_${slideId}`} className="btn-outline text-sm py-2 px-4 cursor-pointer inline-flex items-center gap-2">
                <Upload className="w-4 h-4" /> {mobileImageFile ? 'Change Mobile Image' : 'Upload Mobile Image'}
              </label>
              {(mobileImageFile || showMobileCurrent) && (
                <button type="button" onClick={onRemoveMobile} className="text-xs text-red-400 hover:text-red-300 px-2 py-2">
                  Remove
                </button>
              )}
            </div>
            <input
              id={isNew ? 'slide_img_mobile_new' : `slide_img_mobile_${slideId}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onMobileImageSelect}
            />
            <p className="text-brand-silver/60 text-xs mt-1">Portrait works best · Auto-converted to WebP · Max 500KB</p>
            {mobileImageError && <p className="text-red-400 text-xs mt-1">{mobileImageError}</p>}
          </div>
        </div>
      </div>

      {/* Alt Text (SEO) */}
      <div>
        <label className="block text-brand-silver text-sm font-medium mb-1">Alt Text * <span className="text-brand-silver/50">(SEO / accessibility)</span></label>
        <input type="text" value={form.alt_text} onChange={e => setForm(f => ({ ...f, alt_text: e.target.value }))} className="input-field" placeholder="Professional networking event at UCCI Pune chapter" />
        {errors.alt_text && <p className="text-red-400 text-xs mt-1">{errors.alt_text}</p>}
      </div>

      {/* Title */}
      <div>
        <label className="block text-brand-silver text-sm font-medium mb-1">Title <span className="text-brand-silver/50">(optional)</span></label>
        <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Elite Business Networking" />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-brand-silver text-sm font-medium mb-1">Subtitle <span className="text-brand-silver/50">(optional)</span></label>
        <textarea value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="input-field min-h-[80px] resize-none" placeholder="Join 200+ verified professionals across Pune & PCMC..." />
      </div>

      {/* CTA */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-brand-silver text-sm font-medium mb-1">CTA Button Text <span className="text-brand-silver/50">(needs URL too)</span></label>
          <input type="text" value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} className="input-field" placeholder="Join UCCI Today" />
        </div>
        <div>
          <label className="block text-brand-silver text-sm font-medium mb-1">CTA URL <span className="text-brand-silver/50">(needs text too)</span></label>
          <input type="text" value={form.cta_url} onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))} className="input-field" placeholder="/join" />
        </div>
      </div>
      {(form.cta_text.trim() || form.cta_url.trim()) && !(form.cta_text.trim() && form.cta_url.trim()) && (
        <p className="text-yellow-300/90 text-xs">Fill both CTA text and URL, otherwise no button appears on the homepage.</p>
      )}

      {/* Display Order + Active */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-brand-silver text-sm font-medium mb-1">Display Order</label>
          <input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))} className="input-field" min="0" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-brand-gold" />
            <span className="text-brand-silver text-sm">Active (visible on homepage)</span>
          </label>
        </div>
      </div>

      {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}

      <div className="flex gap-3">
        <button onClick={onSave} disabled={!!loading} className="btn-primary flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {isNew ? 'Create Slide' : 'Save Changes'}
        </button>
        <button onClick={onCancel} className="btn-ghost">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Main Manager ──────────────────────────────────────────────────────────────

export function SlidesManagerClient({ slides: initial, adminId }: SlidesManagerClientProps) {
  const [slides, setSlides] = useState(initial)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SlideFormState>(defaultForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null)
  const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null)
  const [mobileImageError, setMobileImageError] = useState('')
  const [mobileRemoved, setMobileRemoved] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validation = validateImageFile(file)
    if (!validation.valid) { setImageError(validation.error!); return }
    setImageError('')
    try {
      const compressed = await compressImage(file, { maxSizeKB: 500 })
      setImageFile(compressed)
      setImagePreview(URL.createObjectURL(compressed))
    } catch {
      setImageError('Failed to process image. Try another file.')
    }
  }, [])

  const handleMobileImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validation = validateImageFile(file)
    if (!validation.valid) { setMobileImageError(validation.error!); return }
    setMobileImageError('')
    try {
      const compressed = await compressImage(file, { maxSizeKB: 500 })
      setMobileImageFile(compressed)
      setMobileImagePreview(URL.createObjectURL(compressed))
      setMobileRemoved(false)
    } catch {
      setMobileImageError('Failed to process image. Try another file.')
    }
  }, [])

  const handleRemoveMobile = useCallback(() => {
    setMobileImageFile(null)
    setMobileImagePreview(null)
    setMobileImageError('')
    setMobileRemoved(true)
  }, [])

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result as string)
      reader.onerror = rej
      reader.readAsDataURL(file)
    })

  const validateForm = () => {
    const e: Record<string, string> = {}
    if (!form.alt_text.trim()) e.alt_text = 'Alt text is required for accessibility.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = async () => {
    if (!imageFile) { setErrors({ image: 'Please upload a desktop image.' }); return }
    if (!validateForm()) return
    setLoading('create')
    try {
      const b64 = await fileToBase64(imageFile)
      const mobileB64 = mobileImageFile ? await fileToBase64(mobileImageFile) : null
      const result = await createSlide({ ...form, image_b64: b64, image_b64_mobile: mobileB64, created_by: adminId })
      if (result.success && result.data) {
        setSlides(s => [...s, result.data!].sort((a, b) => a.display_order - b.display_order))
        setShowAddForm(false)
        setForm(defaultForm)
        setImageFile(null)
        setImagePreview(null)
        setMobileImageFile(null)
        setMobileImagePreview(null)
        setMobileRemoved(false)
      } else {
        setErrors({ submit: result.error ?? 'Failed to create slide.' })
      }
    } catch {
      setErrors({ submit: 'An unexpected error occurred.' })
    } finally {
      setLoading(null)
    }
  }

  const handleUpdate = async (slideId: string) => {
    if (!validateForm()) return
    setLoading(`update-${slideId}`)
    try {
      const b64 = imageFile ? await fileToBase64(imageFile) : null
      const mobileB64 = mobileImageFile ? await fileToBase64(mobileImageFile) : null
      const result = await updateSlide(slideId, { ...form, image_b64: b64, image_b64_mobile: mobileB64, remove_mobile_image: mobileRemoved && !mobileImageFile })
      if (result.success && result.data) {
        setSlides(s => s.map(sl => sl.id === slideId ? result.data! : sl))
        setEditingId(null)
        setImageFile(null)
        setImagePreview(null)
        setMobileImageFile(null)
        setMobileImagePreview(null)
        setMobileRemoved(false)
      } else {
        setErrors({ submit: result.error ?? 'Failed to update slide.' })
      }
    } catch {
      setErrors({ submit: 'An unexpected error occurred.' })
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (slideId: string) => {
    if (!confirm('Delete this slide? This will remove both desktop and mobile images from storage.')) return
    setLoading(`delete-${slideId}`)
    const result = await deleteSlide(slideId)
    if (result.success) setSlides(s => s.filter(sl => sl.id !== slideId))
    setLoading(null)
  }

  const handleToggleActive = async (slideId: string, current: boolean) => {
    setLoading(`toggle-${slideId}`)
    const result = await toggleSlideActive(slideId, !current)
    if (result.success) setSlides(s => s.map(sl => sl.id === slideId ? { ...sl, is_active: !current } : sl))
    setLoading(null)
  }

  const startEdit = (slide: HeroSlide) => {
    setEditingId(slide.id)
    setForm({
      title: slide.title ?? '',
      subtitle: slide.subtitle ?? '',
      alt_text: slide.alt_text,
      cta_text: slide.cta_text ?? '',
      cta_url: slide.cta_url ?? '',
      display_order: slide.display_order,
      is_active: slide.is_active,
    })
    setImageFile(null)
    setImagePreview(null)
    setMobileImageFile(null)
    setMobileImagePreview(null)
    setMobileImageError('')
    setMobileRemoved(false)
    setErrors({})
  }

  const cancelForm = () => {
    setShowAddForm(false)
    setEditingId(null)
    setForm(defaultForm)
    setImageFile(null)
    setImagePreview(null)
    setMobileImageFile(null)
    setMobileImagePreview(null)
    setMobileImageError('')
    setMobileRemoved(false)
    setErrors({})
  }

  return (
    <div className="space-y-6">
      {/* Add New Button */}
      {!showAddForm && !editingId && (
        <button onClick={() => { setShowAddForm(true); setForm({ ...defaultForm, display_order: slides.length }) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Slide
        </button>
      )}

      {/* Add Form */}
      {showAddForm && (
        <SlideForm
          isNew={true}
          form={form}
          setForm={setForm}
          imageFile={imageFile}
          imagePreview={imagePreview}
          imageError={imageError}
          mobileImageFile={mobileImageFile}
          mobileImagePreview={mobileImagePreview}
          mobileImageError={mobileImageError}
          mobileRemoved={mobileRemoved}
          errors={errors}
          loading={loading}
          onImageSelect={handleImageSelect}
          onMobileImageSelect={handleMobileImageSelect}
          onRemoveMobile={handleRemoveMobile}
          onSave={handleCreate}
          onCancel={cancelForm}
        />
      )}

      {/* Slides List */}
      <div className="space-y-4">
        {slides.length === 0 && !showAddForm && (
          <div className="glass-card p-12 text-center">
            <p className="text-brand-silver">No slides yet. Add your first slide above.</p>
          </div>
        )}

        {slides.map(slide => (
          <div key={slide.id}>
            {editingId === slide.id ? (
              <SlideForm
                isNew={false}
                slideId={slide.id}
                form={form}
                setForm={setForm}
                imageFile={imageFile}
                imagePreview={imagePreview}
                imageError={imageError}
                mobileImageFile={mobileImageFile}
                mobileImagePreview={mobileImagePreview}
                mobileImageError={mobileImageError}
                mobileRemoved={mobileRemoved}
                errors={errors}
                loading={loading}
                currentImageUrl={slide.image_url}
                currentMobileImageUrl={slide.mobile_image_url}
                onImageSelect={handleImageSelect}
                onMobileImageSelect={handleMobileImageSelect}
                onRemoveMobile={handleRemoveMobile}
                onSave={() => handleUpdate(slide.id)}
                onCancel={cancelForm}
              />
            ) : (
              <div className="glass-card p-5 flex items-center gap-5">
                {/* Drag Handle */}
                <GripVertical className="w-5 h-5 text-brand-silver/30 flex-shrink-0 cursor-grab" />

                {/* Thumbnails: desktop + mobile */}
                <div className="flex items-end gap-2 flex-shrink-0">
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-brand-gold/20" title="Desktop / PC">
                    <Image src={slide.image_url} alt={slide.alt_text} fill className="object-cover" sizes="96px" unoptimized />
                  </div>
                  {slide.mobile_image_url ? (
                    <div className="relative w-10 h-16 rounded-lg overflow-hidden border border-brand-gold/40" title="Mobile">
                      <Image src={slide.mobile_image_url} alt={`${slide.alt_text} mobile`} fill className="object-cover" sizes="40px" unoptimized />
                    </div>
                  ) : (
                    <div className="w-10 h-16 rounded-lg border border-dashed border-brand-silver/20 flex items-center justify-center text-[9px] text-brand-silver/40 text-center leading-tight" title="No mobile image, desktop will be used">
                      PC only
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-brand-white font-medium truncate">{slide.title || '(No title, overlay off)'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${slide.is_active ? 'bg-green-500/20 text-green-300' : 'bg-brand-sapphire text-brand-silver/60'}`}>
                      {slide.is_active ? 'Active' : 'Hidden'}
                    </span>
                    <span className="text-brand-silver/50 text-xs">Order: {slide.display_order}</span>
                    {slide.mobile_image_url && <span className="text-xs px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold">Mobile</span>}
                    {slide.cta_text?.trim() && slide.cta_url?.trim() ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300" title={`${slide.cta_text} → ${slide.cta_url}`}>
                        CTA: {slide.cta_text.length > 18 ? slide.cta_text.slice(0, 18) + '…' : slide.cta_text}
                      </span>
                    ) : (slide.cta_text?.trim() || slide.cta_url?.trim()) ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300" title="Button needs BOTH text and URL to appear on homepage">
                        CTA incomplete
                      </span>
                    ) : null}
                  </div>
                  <p className="text-brand-silver/60 text-xs mt-1 truncate">{slide.alt_text}</p>
                  {slide.subtitle && <p className="text-brand-silver text-sm truncate mt-0.5">{slide.subtitle}</p>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(slide.id, slide.is_active)}
                    disabled={loading === `toggle-${slide.id}`}
                    className="p-2 text-brand-silver hover:text-brand-gold transition-colors"
                    title={slide.is_active ? 'Hide slide' : 'Show slide'}
                    aria-label={slide.is_active ? 'Deactivate slide' : 'Activate slide'}
                  >
                    {loading === `toggle-${slide.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : slide.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => startEdit(slide)} className="p-2 text-brand-silver hover:text-brand-gold transition-colors" aria-label="Edit slide">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    disabled={loading === `delete-${slide.id}`}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    aria-label="Delete slide"
                  >
                    {loading === `delete-${slide.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
