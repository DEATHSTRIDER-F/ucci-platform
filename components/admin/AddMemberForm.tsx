'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { compressImage, validateImageFile } from '@/lib/utils/imageCompressor'
import { createMemberOffline } from '@/app/actions/admin'
import { SearchableSelect } from '@/components/forms/SearchableSelect'
import { HotAddCategory } from '@/components/admin/HotAddCategory'
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Upload, X } from 'lucide-react'

interface AddMemberFormProps {
  areas: Array<{ id: string; name: string; chapters: Array<{ id: string; name: string }> }>
  categories: Array<{ id: string; name: string }>
  adminChapterId: string | null // set when added by a chapter_head (locks chapter)
  isSuperAdmin?: boolean // gates inline category creation
}

export function AddMemberForm({ areas, categories: initialCats, adminChapterId, isSuperAdmin }: AddMemberFormProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    business_name: '',
    brand_tagline: '',
    bio: '',
    business_address: '',
    website_url: '',
    linkedin_url: '',
    chapter_id: adminChapterId ?? '',
    category_id: '',
  })
  const [feePaid, setFeePaid] = useState(true)
  const [showPass, setShowPass] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoError, setLogoError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [categories, setCategories] = useState(initialCats)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validation = validateImageFile(file)
    if (!validation.valid) { setLogoError(validation.error!); return }
    setLogoError('')
    try {
      const compressed = await compressImage(file, { maxSizeKB: 100 })
      setLogoFile(compressed)
      setLogoPreview(URL.createObjectURL(compressed))
    } catch {
      setLogoError('Failed to process image. Please try a different file.')
    }
  }, [])

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result as string)
      reader.onerror = rej
      reader.readAsDataURL(file)
    })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required'
    if (!form.password || form.password.length < 8) e.password = 'Minimum 8 characters'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.business_name.trim()) e.business_name = 'Business name is required'
    if (!form.business_address.trim()) e.business_address = 'Business address is required'
    if (!form.chapter_id) e.chapter_id = 'Please select a chapter'
    if (!form.category_id) e.category_id = 'Please select a category'
    if (form.website_url && !/^https?:\/\/.+/.test(form.website_url)) e.website_url = 'Must be a valid URL (https://...)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setPending(true)
    setSubmitError('')
    const result = await createMemberOffline({
      email: form.email,
      password: form.password,
      full_name: form.full_name,
      phone: form.phone,
      business_name: form.business_name,
      brand_tagline: form.brand_tagline || null,
      bio: form.bio || null,
      business_address: form.business_address,
      website_url: form.website_url || null,
      linkedin_url: form.linkedin_url || null,
      chapter_id: form.chapter_id,
      category_id: form.category_id,
      membership_fee_paid: feePaid,
      admin_chapter_id: adminChapterId,
      logo_file: logoFile ? await fileToBase64(logoFile) : null,
    })
    setPending(false)
    if (result.success) {
      setDone(true)
      setTimeout(() => router.push('/admin/members'), 2000)
    } else {
      setSubmitError(result.error ?? 'Failed to add member.')
    }
  }

  if (done) {
    return (
      <div className="glass-card p-10 text-center max-w-2xl">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-brand-white mb-3">Member Added!</h2>
        <p className="text-brand-silver">Login credentials work immediately. Redirecting to members...</p>
      </div>
    )
  }

  const input = (id: string) => 'input-field'

  return (
    <div className="glass-card p-8 space-y-5 max-w-3xl">
      <p className="text-brand-silver text-sm">
        For members who applied offline. Creates their login and an <strong className="text-brand-white">approved</strong> listing immediately — share the temporary password with them directly.
      </p>

      {submitError && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
        </div>
      )}

      {/* Logo Upload */}
      <div>
        <label className="block text-brand-silver text-sm font-medium mb-2">Member Photo / Logo <span className="text-brand-silver/50">(optional)</span></label>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <div className="relative">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-brand-gold/40">
                <Image src={logoPreview} alt="Logo preview" fill className="object-cover" />
              </div>
              <button type="button" onClick={() => { setLogoPreview(null); setLogoFile(null) }} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center" aria-label="Remove logo">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-brand-silver/30 flex items-center justify-center">
              <Upload className="w-6 h-6 text-brand-silver/40" />
            </div>
          )}
          <div>
            <label htmlFor="m_logo" className="btn-outline text-sm py-2 px-4 cursor-pointer">
              {logoFile ? 'Change Photo' : 'Upload Photo'}
            </label>
            <input id="m_logo" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <p className="text-brand-silver/60 text-xs mt-1">WebP · Max 100KB · Auto-optimized</p>
            {logoError && <p className="text-red-400 text-xs mt-1">{logoError}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="m_full_name" className="block text-brand-silver text-sm font-medium mb-1">Full Name *</label>
          <input id="m_full_name" type="text" value={form.full_name} onChange={set('full_name')} className={input('m_full_name')} placeholder="Enter your name" />
          {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
        </div>
        <div>
          <label htmlFor="m_email" className="block text-brand-silver text-sm font-medium mb-1">Email *</label>
          <input id="m_email" type="email" value={form.email} onChange={set('email')} className={input('m_email')} placeholder="email@example.com" />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="m_password" className="block text-brand-silver text-sm font-medium mb-1">Temporary Password *</label>
          <div className="relative">
            <input id="m_password" type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} className="input-field pr-12" placeholder="Min. 8 characters" />
            <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver hover:text-brand-gold" aria-label={showPass ? 'Hide password' : 'Show password'}>
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        </div>
        <div>
          <label htmlFor="m_phone" className="block text-brand-silver text-sm font-medium mb-1">Phone *</label>
          <input id="m_phone" type="tel" value={form.phone} onChange={set('phone')} className={input('m_phone')} placeholder="+91 98765 43210" />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="m_business" className="block text-brand-silver text-sm font-medium mb-1">Business Name *</label>
        <input id="m_business" type="text" value={form.business_name} onChange={set('business_name')} className={input('m_business')} placeholder="Sharma & Associates Consulting Pvt. Ltd." />
        {errors.business_name && <p className="text-red-400 text-xs mt-1">{errors.business_name}</p>}
      </div>

      <div>
        <label htmlFor="m_tagline" className="block text-brand-silver text-sm font-medium mb-1">Brand Tagline <span className="text-brand-silver/50">(optional)</span></label>
        <input id="m_tagline" type="text" value={form.brand_tagline} onChange={set('brand_tagline')} className={input('m_tagline')} placeholder="Your Trusted Financial Partner" />
      </div>

      <div>
        <label htmlFor="m_bio" className="block text-brand-silver text-sm font-medium mb-1">Professional Biography <span className="text-brand-silver/50">(optional)</span></label>
        <textarea id="m_bio" value={form.bio} onChange={set('bio')} className="input-field min-h-[100px] resize-none" placeholder="Describe the business, expertise, and experience..." />
      </div>

      <div>
        <label htmlFor="m_address" className="block text-brand-silver text-sm font-medium mb-1">Business Address *</label>
        <textarea id="m_address" value={form.business_address} onChange={set('business_address')} className="input-field min-h-[80px] resize-none" placeholder="Office 101, Business Square, Wakad, Pune - 411057" />
        {errors.business_address && <p className="text-red-400 text-xs mt-1">{errors.business_address}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="m_website" className="block text-brand-silver text-sm font-medium mb-1">Website <span className="text-brand-silver/50">(optional)</span></label>
          <input id="m_website" type="url" value={form.website_url} onChange={set('website_url')} className={input('m_website')} placeholder="https://www.company.com" />
          {errors.website_url && <p className="text-red-400 text-xs mt-1">{errors.website_url}</p>}
        </div>
        <div>
          <label htmlFor="m_linkedin" className="block text-brand-silver text-sm font-medium mb-1">LinkedIn <span className="text-brand-silver/50">(optional)</span></label>
          <input id="m_linkedin" type="url" value={form.linkedin_url} onChange={set('linkedin_url')} className={input('m_linkedin')} placeholder="https://www.linkedin.com/in/profile" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="m_chapter" className="block text-brand-silver text-sm font-medium mb-1">Chapter *</label>
          <SearchableSelect
            id="m_chapter"
            value={form.chapter_id}
            onChange={v => setForm(f => ({ ...f, chapter_id: v }))}
            groups={areas.map(area => ({
              label: area.name,
              options: area.chapters.map(ch => ({ value: ch.id, label: `${area.name} - ${ch.name}` })),
            }))}
            placeholder="-- Select chapter --"
            disabled={!!adminChapterId}
            ariaLabel="Chapter"
          />
          {errors.chapter_id && <p className="text-red-400 text-xs mt-1">{errors.chapter_id}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="m_category" className="block text-brand-silver text-sm font-medium">Business Category *</label>
            {isSuperAdmin && (
              <HotAddCategory
                onCreated={cat => {
                  setCategories(c => [...c, cat].sort((a, b) => a.name.localeCompare(b.name)))
                  setForm(f => ({ ...f, category_id: cat.id }))
                }}
              />
            )}
          </div>
          <SearchableSelect
            id="m_category"
            value={form.category_id}
            onChange={v => setForm(f => ({ ...f, category_id: v }))}
            options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
            placeholder="-- Select category --"
            ariaLabel="Business category"
          />
          {errors.category_id && <p className="text-red-400 text-xs mt-1">{errors.category_id}</p>}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer bg-brand-navy/40 border border-brand-silver/20 rounded-lg px-4 py-3">
        <input type="checkbox" checked={feePaid} onChange={e => setFeePaid(e.target.checked)} className="w-4 h-4 accent-brand-gold" />
        <span className="text-brand-silver text-sm">Membership fee collected offline (₹10,000)</span>
      </label>

      <div className="flex gap-3">
        <button type="button" onClick={handleSubmit} disabled={pending} className="btn-primary flex-1 flex justify-center items-center gap-2">
          {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding Member...</> : 'Add Member'}
        </button>
        <button type="button" onClick={() => router.push('/admin/members')} disabled={pending} className="btn-outline px-6">
          Cancel
        </button>
      </div>
    </div>
  )
}
