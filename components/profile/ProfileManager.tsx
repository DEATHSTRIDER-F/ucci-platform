'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Globe, Linkedin, Phone, MapPin, Building2, Tag, User, Pencil, X, Loader2, CheckCircle, AlertCircle, Upload, Crown } from 'lucide-react'
import { compressImage, validateImageFile } from '@/lib/utils/imageCompressor'
import { updateOwnProfile } from '@/app/actions/profile'
import { submitChapterHeadApplication } from '@/app/actions/chapter-head'

export interface ProfileData {
  id: string
  email: string
  full_name: string
  role: string
  status: string | null
  business_name: string | null
  brand_tagline: string | null
  bio: string | null
  phone: string | null
  website_url: string | null
  linkedin_url: string | null
  business_address: string | null
  logo_url: string | null
  ideal_referral_target: string | null
  referral_triggers: string | null
  chapter?: { id: string; name: string; slug: string; area?: { id: string; name: string; slug: string } } | null
  category?: { id: string; name: string; slug: string } | null
}

export function ProfileManager({
  profile,
  chapterHasHead,
  alreadyApplied,
}: {
  profile: ProfileData
  chapterHasHead: boolean
  alreadyApplied: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    business_name: profile.business_name ?? '',
    brand_tagline: profile.brand_tagline ?? '',
    bio: profile.bio ?? '',
    phone: profile.phone ?? '',
    website_url: profile.website_url ?? '',
    linkedin_url: profile.linkedin_url ?? '',
    business_address: profile.business_address ?? '',
    ideal_referral_target: profile.ideal_referral_target ?? '',
    referral_triggers: profile.referral_triggers ?? '',
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoError, setLogoError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [confirmingHead, setConfirmingHead] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(alreadyApplied)
  const [applyError, setApplyError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.business_name.trim()) e.business_name = 'Business name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.business_address.trim()) e.business_address = 'Business address is required'
    if (form.website_url && !/^https?:\/\/.+/.test(form.website_url)) e.website_url = 'Must be a valid URL (https://...)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    let b64: string | null = null
    if (logoFile) {
      b64 = await new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = () => res(reader.result as string)
        reader.onerror = rej
        reader.readAsDataURL(logoFile)
      })
    }
    const result = await updateOwnProfile({
      ...form,
      brand_tagline: form.brand_tagline || null,
      bio: form.bio || null,
      website_url: form.website_url || null,
      linkedin_url: form.linkedin_url || null,
      ideal_referral_target: form.ideal_referral_target || null,
      referral_triggers: form.referral_triggers || null,
      logo_file: b64,
    })
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setEditing(false)
      setLogoFile(null)
      setLogoPreview(null)
      setTimeout(() => window.location.reload(), 1200)
    } else {
      setErrors({ submit: result.error ?? 'Failed to save.' })
    }
  }

  const handleApplyHead = async () => {
    if (!profile.chapter?.id) return
    setApplying(true)
    setApplyError('')
    const result = await submitChapterHeadApplication({
      name: profile.full_name,
      email: profile.email,
      phone: profile.phone ?? '',
      chapter_id: profile.chapter.id,
      message: `${profile.full_name} (${profile.business_name ?? 'member'}) volunteered to lead the ${profile.chapter.area?.name ?? ''} ${profile.chapter.name} chapter from their profile page.`,
    })
    setApplying(false)
    if (result.success) {
      setApplied(true)
      setConfirmingHead(false)
    } else {
      setApplyError(result.error ?? 'Submission failed.')
    }
  }

  const showStartChapter = profile.role === 'member' && profile.status === 'approved' && !chapterHasHead
  const chapterLabel = profile.chapter ? `${profile.chapter.area?.name ?? ''} ${profile.chapter.name}`.trim() : ''

  return (
    <div className="space-y-6">
      {saved && (
        <div className="glass-card p-4 flex items-center gap-2 text-green-300 text-sm" role="status">
          <CheckCircle className="w-5 h-5" /> Profile updated!
        </div>
      )}

      {/* Profile Card */}
      <article className="glass-card p-8" itemScope itemType="https://schema.org/ProfessionalService">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-brand-gold/40 flex-shrink-0">
            {(logoPreview || profile.logo_url) ? (
              <Image src={logoPreview ?? profile.logo_url!} alt={`${profile.business_name ?? profile.full_name} logo`} fill className="object-cover" sizes="96px" />
            ) : (
              <div className="w-full h-full bg-brand-gold/20 flex items-center justify-center">
                <User className="w-10 h-10 text-brand-gold" />
              </div>
            )}
          </div>
          <div className="flex-1 w-full">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-white" itemProp="name">
                  {profile.business_name ?? profile.full_name}
                </h1>
                {profile.brand_tagline && (
                  <p className="text-brand-champagne text-lg mt-1 italic">{profile.brand_tagline}</p>
                )}
              </div>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="btn-outline text-xs py-2 px-4 inline-flex items-center gap-1.5 flex-shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.category && (
                <Link href={`/categories/${profile.category.slug}`} className="badge flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {profile.category.name}
                </Link>
              )}
              {profile.chapter && (
                <Link href={`/chapters/${profile.chapter.area?.slug}-${profile.chapter.slug}`} className="badge flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> UCCI {profile.chapter.name}, {profile.chapter.area?.name}
                </Link>
              )}
            </div>
          </div>
        </div>

        {editing ? (
          <div className="mt-6 pt-6 border-t border-brand-sapphire/50 space-y-4">
            <h2 className="font-display text-lg font-bold text-brand-gold">Edit Profile</h2>
            <p className="text-brand-silver/60 text-xs">Chapter and category cannot be changed here — contact admin for those.</p>

            <div>
              <label className="block text-brand-silver text-sm font-medium mb-2">Photo / Logo <span className="text-brand-silver/50">(optional)</span></label>
              <div className="flex items-center gap-3">
                <label htmlFor="p_logo" className="btn-outline text-xs py-2 px-4 cursor-pointer">Upload Photo</label>
                <input id="p_logo" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                {logoFile && <span className="text-green-400 text-xs">New photo selected</span>}
              </div>
              {logoError && <p className="text-red-400 text-xs mt-1">{logoError}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="p_name" className="block text-brand-silver text-sm font-medium mb-1">Full Name *</label>
                <input id="p_name" value={form.full_name} onChange={set('full_name')} className="input-field text-sm" />
                {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
              </div>
              <div>
                <label htmlFor="p_biz" className="block text-brand-silver text-sm font-medium mb-1">Business Name *</label>
                <input id="p_biz" value={form.business_name} onChange={set('business_name')} className="input-field text-sm" />
                {errors.business_name && <p className="text-red-400 text-xs mt-1">{errors.business_name}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="p_tag" className="block text-brand-silver text-sm font-medium mb-1">Brand Tagline</label>
              <input id="p_tag" value={form.brand_tagline} onChange={set('brand_tagline')} className="input-field text-sm" />
            </div>
            <div>
              <label htmlFor="p_bio" className="block text-brand-silver text-sm font-medium mb-1">Professional Biography</label>
              <textarea id="p_bio" value={form.bio} onChange={set('bio')} className="input-field text-sm min-h-[100px] resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="p_phone" className="block text-brand-silver text-sm font-medium mb-1">Phone *</label>
                <input id="p_phone" value={form.phone} onChange={set('phone')} className="input-field text-sm" />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="p_addr" className="block text-brand-silver text-sm font-medium mb-1">Business Address *</label>
                <input id="p_addr" value={form.business_address} onChange={set('business_address')} className="input-field text-sm" />
                {errors.business_address && <p className="text-red-400 text-xs mt-1">{errors.business_address}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="p_web" className="block text-brand-silver text-sm font-medium mb-1">Website</label>
                <input id="p_web" value={form.website_url} onChange={set('website_url')} className="input-field text-sm" />
                {errors.website_url && <p className="text-red-400 text-xs mt-1">{errors.website_url}</p>}
              </div>
              <div>
                <label htmlFor="p_li" className="block text-brand-silver text-sm font-medium mb-1">LinkedIn</label>
                <input id="p_li" value={form.linkedin_url} onChange={set('linkedin_url')} className="input-field text-sm" />
              </div>
            </div>
            <div>
              <label htmlFor="p_target" className="block text-brand-silver text-sm font-medium mb-1">Ideal Referral Target</label>
              <textarea id="p_target" value={form.ideal_referral_target} onChange={set('ideal_referral_target')} className="input-field text-sm min-h-[80px] resize-none" />
            </div>
            <div>
              <label htmlFor="p_trig" className="block text-brand-silver text-sm font-medium mb-1">Referral Triggers</label>
              <textarea id="p_trig" value={form.referral_triggers} onChange={set('referral_triggers')} className="input-field text-sm min-h-[80px] resize-none" />
            </div>

            {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-6 flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Save Changes
              </button>
              <button onClick={() => setEditing(false)} disabled={saving} className="btn-ghost text-sm inline-flex items-center gap-1">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {profile.bio && (
              <section className="mt-6 pt-6 border-t border-brand-sapphire/50" aria-label="About">
                <h2 className="font-display text-lg font-bold text-brand-gold mb-2">About</h2>
                <p className="text-brand-silver leading-relaxed text-sm">{profile.bio}</p>
              </section>
            )}
            <section className="mt-6 pt-6 border-t border-brand-sapphire/50" aria-label="Contact details">
              <h2 className="font-display text-lg font-bold text-brand-gold mb-3">Contact & Location</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-3 text-brand-silver"><User className="w-4 h-4 text-brand-gold/60" />{profile.email}</div>
                {profile.phone && <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-brand-silver hover:text-brand-gold"><Phone className="w-4 h-4 text-brand-gold/60" />{profile.phone}</a>}
                {profile.website_url && <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-brand-silver hover:text-brand-gold"><Globe className="w-4 h-4 text-brand-gold/60" /><span className="truncate">{profile.website_url}</span></a>}
                {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-brand-silver hover:text-brand-gold"><Linkedin className="w-4 h-4 text-brand-gold/60" />LinkedIn Profile</a>}
                {profile.business_address && <div className="flex items-start gap-3 text-brand-silver"><MapPin className="w-4 h-4 text-brand-gold/60 mt-0.5" />{profile.business_address}</div>}
              </div>
            </section>
            {(profile.ideal_referral_target || profile.referral_triggers) && (
              <section className="mt-6 pt-6 border-t border-brand-sapphire/50" aria-label="Networking profile">
                <h2 className="font-display text-lg font-bold text-brand-gold mb-3">Networking Profile</h2>
                {profile.ideal_referral_target && <p className="text-brand-silver text-sm mb-2"><strong className="text-brand-champagne">Ideal target:</strong> {profile.ideal_referral_target}</p>}
                {profile.referral_triggers && <p className="text-brand-silver text-sm"><strong className="text-brand-champagne">Triggers:</strong> {profile.referral_triggers}</p>}
              </section>
            )}
          </>
        )}
      </article>

      {/* Start a Chapter */}
      {showStartChapter && (
        <div className="glass-card p-6 sm:p-8">
          {!confirmingHead && !applied && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-brand-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-brand-gold" /> Lead your chapter
                </h2>
                <p className="text-brand-silver text-sm mt-1">
                  {chapterLabel} has no chapter head yet. Step up and shape your local community.
                </p>
              </div>
              <button onClick={() => setConfirmingHead(true)} className="btn-primary text-sm flex-shrink-0">
                Start a Chapter
              </button>
            </div>
          )}
          {confirmingHead && !applied && (
            <div>
              <h2 className="font-display text-lg font-bold text-brand-white">Confirm your application</h2>
              <p className="text-brand-silver text-sm mt-2">
                We&apos;ll send the admin your name ({profile.full_name}), email ({profile.email}), phone ({profile.phone ?? '—'}),
                and chapter ({chapterLabel}). They&apos;ll review and reach out.
              </p>
              {applyError && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{applyError}</p>}
              <div className="flex gap-2 mt-4">
                <button onClick={handleApplyHead} disabled={applying} className="btn-primary text-sm px-6 disabled:opacity-50">
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
                <button onClick={() => setConfirmingHead(false)} disabled={applying} className="btn-ghost text-sm">Cancel</button>
              </div>
            </div>
          )}
          {applied && (
            <div className="flex items-center gap-2 text-green-300 text-sm" role="status">
              <CheckCircle className="w-5 h-5" /> Application sent! The admin team will review it shortly.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
