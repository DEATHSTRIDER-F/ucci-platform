'use client'

import { useState, useEffect, useCallback } from 'react'
import { compressImage, validateImageFile } from '@/lib/utils/imageCompressor'
import { submitOnboarding, signupAndApply } from '@/app/actions/onboarding'
import { createClient } from '@/lib/supabase/client'
import { AppointmentCalendar } from '@/components/calendar/AppointmentCalendar'
import { ChevronDown, ChevronUp, Loader2, CheckCircle, AlertCircle, Upload, X, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

interface Area {
  id: string
  name: string
  slug: string
  chapters: Array<{ id: string; name: string; slug: string }>
}

interface Category {
  id: string
  name: string
  slug: string
}

interface OnboardingFormProps {
  areas: Area[]
  categories: Category[]
  initialChapterId?: string | null
  prefilledChapterName?: string | null
  isLoggedIn?: boolean
  initialName?: string | null
  initialEmail?: string | null
}

export function OnboardingForm({ areas, categories, initialChapterId, prefilledChapterName, isLoggedIn, initialName, initialEmail }: OnboardingFormProps) {
  const [step, setStep] = useState<'form' | 'calendar' | 'submitting' | 'success'>('form')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoError, setLogoError] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [exclusivityWarning, setExclusivityWarning] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPass, setShowPass] = useState(false)

  const [account, setAccount] = useState({ full_name: '', email: '', password: '' })

  const [form, setForm] = useState({
    company_full_name: '',
    brand_tagline: '',
    bio: '',
    phone: '',
    website_url: '',
    linkedin_url: '',
    business_address: '',
    ideal_referral_target: '',
    referral_triggers: '',
    chapter_id: initialChapterId ?? '',
    category_id: '',
  })

  // Check exclusivity when chapter + category selected
  useEffect(() => {
    if (!form.chapter_id || !form.category_id) {
      setExclusivityWarning('')
      return
    }
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('id, business_name, full_name')
      .eq('chapter_id', form.chapter_id)
      .eq('category_id', form.category_id)
      .eq('status', 'approved')
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExclusivityWarning(
            `⚠️ This category is already occupied in this chapter by ${data.business_name ?? data.full_name}. Please select a different chapter or category.`
          )
        } else {
          setExclusivityWarning('')
        }
      })
  }, [form.chapter_id, form.category_id])

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
    if (!isLoggedIn) {
      if (!account.full_name.trim()) e.full_name = 'Full name is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) e.email = 'Valid email is required'
      if (!account.password || account.password.length < 8) e.password = 'Minimum 8 characters'
    }
    if (!form.company_full_name.trim()) e.company_full_name = 'Company name is required'
    if (!form.bio.trim()) e.bio = 'Professional biography is required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    if (!form.business_address.trim()) e.business_address = 'Business address is required'
    if (!form.chapter_id) e.chapter_id = 'Please select a chapter'
    if (!form.category_id) e.category_id = 'Please select a category'
    if (form.website_url && !/^https?:\/\/.+/.test(form.website_url)) e.website_url = 'Must be a valid URL (https://...)'
    if (form.linkedin_url && !/^https?:\/\/.+linkedin\.com.+/.test(form.linkedin_url)) e.linkedin_url = 'Must be a valid LinkedIn URL'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (!validate()) return
    if (exclusivityWarning) return
    setStep('calendar')
  }

  const handleSubmit = async () => {
    if (!selectedDate) return
    setStep('submitting')
    setSubmitError('')
    try {
      const base = {
        ...form,
        logo_file: logoFile ? await fileToBase64(logoFile) : null,
        logo_filename: logoFile?.name ?? null,
        appointment_date: selectedDate,
      }
      const result = isLoggedIn
        ? await submitOnboarding(base)
        : await signupAndApply({ ...base, full_name: account.full_name, email: account.email, password: account.password })
      if (result.success) {
        if (!isLoggedIn) {
          // Sign the fresh account in so the pending state shows immediately
          const supabase = createClient()
          await supabase.auth.signInWithPassword({ email: account.email, password: account.password })
        }
        setStep('success')
      } else {
        setSubmitError(result.error ?? 'Submission failed. Please try again.')
        setStep('calendar')
      }
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.')
      setStep('calendar')
    }
  }

  if (step === 'success') {
    return (
      <div className="glass-card p-6 sm:p-10 text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="font-display text-xl sm:text-2xl font-bold text-brand-white mb-3">Application Submitted!</h2>
        <p className="text-brand-silver leading-relaxed">
          Your application has been received. Your profile will be reviewed by the chapter admin after your scheduled interview.
        </p>
        <div className="mt-6 bg-brand-gold/10 border border-brand-gold/30 rounded-lg p-4 text-brand-champagne text-sm">
          <strong>Next steps:</strong> Attend your scheduled interview appointment.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-3">
        <div className={`flex-1 h-1 rounded-full ${step === 'form' ? 'bg-brand-gold' : 'bg-brand-gold'}`} />
        <div className={`flex-1 h-1 rounded-full ${step === 'calendar' || step === 'submitting' ? 'bg-brand-gold' : 'bg-brand-sapphire'}`} />
      </div>

      {step === 'form' && (
        <div className="glass-card p-5 sm:p-8 space-y-6">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-brand-white">Business Information</h2>

          {/* Logo Upload */}
          <div>
            <label className="block text-brand-silver text-sm font-medium mb-2">Company Logo <span className="text-brand-silver/50">(optional)</span></label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-brand-gold/40">
                    <Image src={logoPreview} alt="Logo preview" fill className="object-cover" />
                  </div>
                  <button onClick={() => { setLogoPreview(null); setLogoFile(null) }} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-brand-silver/30 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-brand-silver/40" />
                </div>
              )}
              <div>
                <label htmlFor="logo_upload" className="btn-outline text-sm py-2 px-4 cursor-pointer">
                  {logoFile ? 'Change Logo' : 'Upload Logo'}
                </label>
                <input id="logo_upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <p className="text-brand-silver/60 text-xs mt-1">WebP · Max 100KB · Auto-optimized</p>
                {logoError && <p className="text-red-400 text-xs mt-1">{logoError}</p>}
              </div>
            </div>
          </div>

          {/* Account (auto-filled when logged in) */}
          {isLoggedIn ? (
            <div className="bg-brand-navy/40 border border-brand-silver/20 rounded-lg px-4 py-3 text-sm">
              <span className="text-brand-silver/60">Applying as </span>
              <span className="text-brand-white font-medium">{initialName ?? ''}</span>
              <span className="text-brand-silver/60"> · </span>
              <span className="text-brand-white">{initialEmail ?? ''}</span>
            </div>
          ) : (
            <>
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-brand-silver text-sm font-medium mb-1">Full Name *</label>
                <input id="full_name" type="text" value={account.full_name} onChange={e => setAccount(a => ({ ...a, full_name: e.target.value }))} className="input-field" placeholder="Enter your name" />
                {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
              </div>
            </>
          )}

          {/* Company Name */}
          <div>
            <label htmlFor="company_full_name" className="block text-brand-silver text-sm font-medium mb-1">Company Full Name *</label>
            <input id="company_full_name" type="text" value={form.company_full_name} onChange={e => setForm(f => ({ ...f, company_full_name: e.target.value }))} className="input-field" placeholder="Sharma & Associates Consulting Pvt. Ltd." />
            {errors.company_full_name && <p className="text-red-400 text-xs mt-1">{errors.company_full_name}</p>}
          </div>

          {/* Email + Password (new account) */}
          {!isLoggedIn && (
            <>
              <div>
                <label htmlFor="email" className="block text-brand-silver text-sm font-medium mb-1">Email *</label>
                <input id="email" type="email" value={account.email} onChange={e => setAccount(a => ({ ...a, email: e.target.value }))} className="input-field" placeholder="email@example.com" />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-brand-silver text-sm font-medium mb-1">Create Password *</label>
                <div className="relative">
                  <input id="password" type={showPass ? 'text' : 'password'} value={account.password} onChange={e => setAccount(a => ({ ...a, password: e.target.value }))} className="input-field pr-12" placeholder="Min. 8 characters — you will log in with this" />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver hover:text-brand-gold" aria-label={showPass ? 'Hide password' : 'Show password'}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
            </>
          )}

          {/* Brand Tagline */}
          <div>
            <label htmlFor="brand_tagline" className="block text-brand-silver text-sm font-medium mb-1">Brand Tagline <span className="text-brand-silver/50">(optional)</span></label>
            <input id="brand_tagline" type="text" value={form.brand_tagline} onChange={e => setForm(f => ({ ...f, brand_tagline: e.target.value }))} className="input-field" placeholder="Your Trusted Financial Partner" />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-brand-silver text-sm font-medium mb-1">Professional Biography *</label>
            <textarea id="bio" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="input-field min-h-[120px] resize-none" placeholder="Describe your business, expertise, and experience..." />
            {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-brand-silver text-sm font-medium mb-1">Primary Phone *</label>
            <input id="phone" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+91 98765 43210" />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website_url" className="block text-brand-silver text-sm font-medium mb-1">Website <span className="text-brand-silver/50">(optional)</span></label>
            <input id="website_url" type="url" value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} className="input-field" placeholder="https://www.yourcompany.com" />
            {errors.website_url && <p className="text-red-400 text-xs mt-1">{errors.website_url}</p>}
          </div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="linkedin_url" className="block text-brand-silver text-sm font-medium mb-1">LinkedIn Profile <span className="text-brand-silver/50">(optional)</span></label>
            <input id="linkedin_url" type="url" value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} className="input-field" placeholder="https://www.linkedin.com/in/yourprofile" />
            {errors.linkedin_url && <p className="text-red-400 text-xs mt-1">{errors.linkedin_url}</p>}
          </div>

          {/* Business Address */}
          <div>
            <label htmlFor="business_address" className="block text-brand-silver text-sm font-medium mb-1">Business Address *</label>
            <textarea id="business_address" value={form.business_address} onChange={e => setForm(f => ({ ...f, business_address: e.target.value }))} className="input-field min-h-[80px] resize-none" placeholder="Office 101, Business Square, Wakad, Pune - 411057" />
            {errors.business_address && <p className="text-red-400 text-xs mt-1">{errors.business_address}</p>}
          </div>

          {/* Chapter Selection */}
          <div>
            <label htmlFor="chapter_id" className="block text-brand-silver text-sm font-medium mb-1">Select Chapter *</label>
            {prefilledChapterName && (
              <p className="text-brand-champagne text-xs mb-1.5">Pre-filled from {prefilledChapterName} — you can change it below.</p>
            )}
            <select id="chapter_id" value={form.chapter_id} onChange={e => setForm(f => ({ ...f, chapter_id: e.target.value }))} className="input-field">
              <option value="">-- Select your preferred chapter --</option>
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

          {/* Category Selection */}
          <div>
            <label htmlFor="category_id" className="block text-brand-silver text-sm font-medium mb-1">Business Category *</label>
            <select id="category_id" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="input-field">
              <option value="">-- Select your business category --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-red-400 text-xs mt-1">{errors.category_id}</p>}
          </div>

          {/* Exclusivity Warning */}
          {exclusivityWarning && (
            <div className="flex items-start gap-2 text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{exclusivityWarning}</span>
            </div>
          )}

          {/* Advanced Networking Profile Accordion */}
          <div className="border border-brand-silver/20 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-brand-champagne font-medium hover:bg-brand-sapphire/50 transition-colors"
              aria-expanded={advancedOpen}
            >
              <span>Advanced Networking Profile <span className="text-brand-silver/50 text-sm font-normal">(Optional)</span></span>
              {advancedOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {advancedOpen && (
              <div className="px-5 pb-5 space-y-4 bg-brand-navy/30">
                <div>
                  <label htmlFor="ideal_referral_target" className="block text-brand-silver text-sm font-medium mb-1">Ideal Referral Target</label>
                  <textarea
                    id="ideal_referral_target"
                    value={form.ideal_referral_target}
                    onChange={e => setForm(f => ({ ...f, ideal_referral_target: e.target.value }))}
                    className="input-field min-h-[100px] resize-none"
                    placeholder="e.g., Real estate developers launching residential projects in Baner, or local retail footwear brand owners looking to export."
                  />
                </div>
                <div>
                  <label htmlFor="referral_triggers" className="block text-brand-silver text-sm font-medium mb-1">Referral Triggers</label>
                  <textarea
                    id="referral_triggers"
                    value={form.referral_triggers}
                    onChange={e => setForm(f => ({ ...f, referral_triggers: e.target.value }))}
                    className="input-field min-h-[100px] resize-none"
                    placeholder="e.g., Listen for business owners saying: 'Our foot traffic is dropping, we need to build an e-commerce platform but don't know who to trust.'"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={!!exclusivityWarning}
            className="btn-primary w-full text-base"
          >
            Next: Select Interview Slot →
          </button>
        </div>
      )}

      {(step === 'calendar' || step === 'submitting') && (
        <div className="space-y-6">
          <button type="button" onClick={() => setStep('form')} className="text-brand-silver hover:text-brand-gold text-sm flex items-center gap-1 transition-colors">
            ← Back to Form
          </button>

          {submitError && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
            </div>
          )}

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-bold text-brand-white mb-4">Select Interview Appointment</h2>
            <AppointmentCalendar
              chapterId={form.chapter_id}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedDate || step === 'submitting'}
            className="btn-primary w-full text-base flex items-center justify-center gap-2"
          >
            {step === 'submitting' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Application...</>
            ) : (
              'Submit Application'
            )}
          </button>

          {!selectedDate && (
            <p className="text-brand-silver/60 text-sm text-center">Please select an interview date to proceed</p>
          )}
        </div>
      )}
    </div>
  )
}

// Helper to convert File to base64 for server transmission
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
