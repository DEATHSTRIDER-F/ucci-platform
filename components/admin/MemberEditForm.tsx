'use client'

import { useState } from 'react'
import { updateMemberAdmin } from '@/app/actions/admin'
import { SearchableSelect } from '@/components/forms/SearchableSelect'
import { HotAddCategory } from '@/components/admin/HotAddCategory'
import { Loader2, Pencil, X, CheckCircle } from 'lucide-react'

interface Props {
  profileId: string
  initial: {
    full_name: string
    business_name: string | null
    brand_tagline: string | null
    bio: string | null
    phone: string | null
    website_url: string | null
    linkedin_url: string | null
    business_address: string | null
    ideal_referral_target: string | null
    referral_triggers: string | null
    chapter_id: string | null
    category_id: string | null
  }
  areas: Array<{ id: string; name: string; chapters: Array<{ id: string; name: string }> }>
  categories: Array<{ id: string; name: string }>
}

export function MemberEditForm({ profileId, initial, areas, categories: initialCats }: Props) {
  const [editing, setEditing] = useState(false)
  const [categories, setCategories] = useState(initialCats)
  const [form, setForm] = useState({
    full_name: initial.full_name ?? '',
    business_name: initial.business_name ?? '',
    brand_tagline: initial.brand_tagline ?? '',
    bio: initial.bio ?? '',
    phone: initial.phone ?? '',
    website_url: initial.website_url ?? '',
    linkedin_url: initial.linkedin_url ?? '',
    business_address: initial.business_address ?? '',
    ideal_referral_target: initial.ideal_referral_target ?? '',
    referral_triggers: initial.referral_triggers ?? '',
    chapter_id: initial.chapter_id ?? '',
    category_id: initial.category_id ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const chapterGroups = areas.map(a => ({
    label: a.name,
    options: a.chapters.map(ch => ({ value: ch.id, label: `${a.name} - ${ch.name}` })),
  }))

  const handleSave = async () => {
    const e: Record<string, string> = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.business_name.trim()) e.business_name = 'Business name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.business_address.trim()) e.business_address = 'Business address is required'
    if (!form.chapter_id) e.chapter_id = 'Chapter is required'
    if (!form.category_id) e.category_id = 'Category is required'
    setErrors(e)
    if (Object.keys(e).length) return
    setSaving(true)
    const result = await updateMemberAdmin(profileId, {
      full_name: form.full_name,
      business_name: form.business_name,
      brand_tagline: form.brand_tagline || null,
      bio: form.bio || null,
      phone: form.phone,
      website_url: form.website_url || null,
      linkedin_url: form.linkedin_url || null,
      business_address: form.business_address,
      ideal_referral_target: form.ideal_referral_target || null,
      referral_triggers: form.referral_triggers || null,
      chapter_id: form.chapter_id,
      category_id: form.category_id,
    })
    setSaving(false)
    if (result.success) {
      setEditing(false)
      window.location.reload()
    } else {
      setErrors({ submit: result.error ?? 'Failed to save.' })
    }
  }

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="btn-outline text-xs py-2 px-4 inline-flex items-center gap-1.5">
        <Pencil className="w-3.5 h-3.5" /> Edit Member (all fields)
      </button>
    )
  }

  const field = 'input-field text-sm'
  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="font-display font-bold text-brand-gold">Edit Member</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-brand-silver text-sm font-medium mb-1">Full Name *</label>
          <input value={form.full_name} onChange={set('full_name')} className={field} />
          {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
        </div>
        <div>
          <label className="block text-brand-silver text-sm font-medium mb-1">Business Name *</label>
          <input value={form.business_name} onChange={set('business_name')} className={field} />
          {errors.business_name && <p className="text-red-400 text-xs mt-1">{errors.business_name}</p>}
        </div>
      </div>
      <div>
        <label className="block text-brand-silver text-sm font-medium mb-1">Brand Tagline</label>
        <input value={form.brand_tagline} onChange={set('brand_tagline')} className={field} />
      </div>
      <div>
        <label className="block text-brand-silver text-sm font-medium mb-1">Bio</label>
        <textarea value={form.bio} onChange={set('bio')} className={`${field} min-h-[90px] resize-none`} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-brand-silver text-sm font-medium mb-1">Phone *</label>
          <input value={form.phone} onChange={set('phone')} className={field} />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-brand-silver text-sm font-medium mb-1">Business Address *</label>
          <input value={form.business_address} onChange={set('business_address')} className={field} />
          {errors.business_address && <p className="text-red-400 text-xs mt-1">{errors.business_address}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-brand-silver text-sm font-medium mb-1">Website</label>
          <input value={form.website_url} onChange={set('website_url')} className={field} />
        </div>
        <div>
          <label className="block text-brand-silver text-sm font-medium mb-1">LinkedIn</label>
          <input value={form.linkedin_url} onChange={set('linkedin_url')} className={field} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-brand-silver text-sm font-medium mb-1">Chapter *</label>
          <SearchableSelect
            value={form.chapter_id}
            onChange={v => setForm(f => ({ ...f, chapter_id: v }))}
            groups={chapterGroups}
            placeholder="-- Select chapter --"
            ariaLabel="Chapter"
          />
          {errors.chapter_id && <p className="text-red-400 text-xs mt-1">{errors.chapter_id}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-brand-silver text-sm font-medium">Category *</label>
            <HotAddCategory
              onCreated={cat => {
                setCategories(c => [...c, cat].sort((a, b) => a.name.localeCompare(b.name)))
                setForm(f => ({ ...f, category_id: cat.id }))
              }}
            />
          </div>
          <SearchableSelect
            value={form.category_id}
            onChange={v => setForm(f => ({ ...f, category_id: v }))}
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            placeholder="-- Select category --"
            ariaLabel="Category"
          />
          {errors.category_id && <p className="text-red-400 text-xs mt-1">{errors.category_id}</p>}
        </div>
      </div>
      <div>
        <label className="block text-brand-silver text-sm font-medium mb-1">Ideal Referral Target</label>
        <textarea value={form.ideal_referral_target} onChange={set('ideal_referral_target')} className={`${field} min-h-[70px] resize-none`} />
      </div>
      <div>
        <label className="block text-brand-silver text-sm font-medium mb-1">Referral Triggers</label>
        <textarea value={form.referral_triggers} onChange={set('referral_triggers')} className={`${field} min-h-[70px] resize-none`} />
      </div>
      {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-6 flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Save
        </button>
        <button onClick={() => setEditing(false)} disabled={saving} className="btn-ghost text-sm inline-flex items-center gap-1">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  )
}
