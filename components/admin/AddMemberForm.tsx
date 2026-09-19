'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMemberOffline } from '@/app/actions/admin'
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

interface AddMemberFormProps {
  areas: Array<{ id: string; name: string; chapters: Array<{ id: string; name: string }> }>
  categories: Array<{ id: string; name: string }>
  adminChapterId: string | null // set when added by a chapter_admin (locks chapter)
}

export function AddMemberForm({ areas, categories, adminChapterId }: AddMemberFormProps) {
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

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
          <select id="m_chapter" value={form.chapter_id} onChange={set('chapter_id')} className={input('m_chapter')} disabled={!!adminChapterId}>
            <option value="">-- Select chapter --</option>
            {areas.map(area => (
              <optgroup key={area.id} label={area.name}>
                {area.chapters.map(ch => (
                  <option key={ch.id} value={ch.id}>{area.name} - {ch.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {errors.chapter_id && <p className="text-red-400 text-xs mt-1">{errors.chapter_id}</p>}
        </div>
        <div>
          <label htmlFor="m_category" className="block text-brand-silver text-sm font-medium mb-1">Business Category *</label>
          <select id="m_category" value={form.category_id} onChange={set('category_id')} className={input('m_category')}>
            <option value="">-- Select category --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
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
