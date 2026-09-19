'use client'

import { useState } from 'react'
import { submitChapterHeadApplication } from '@/app/actions/chapter-head'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ChapterHeadFormProps {
  chapters: Array<{ id: string; name: string; areaName: string }>
}

export function ChapterHeadForm({ chapters }: ChapterHeadFormProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', chapter_id: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setPending(true)
    setSubmitError('')
    const result = await submitChapterHeadApplication({
      name: form.name,
      email: form.email,
      phone: form.phone,
      chapter_id: form.chapter_id || null,
      message: form.message || null,
    })
    setPending(false)
    if (result.success) {
      setDone(true)
    } else {
      setSubmitError(result.error ?? 'Submission failed. Please try again.')
    }
  }

  if (done) {
    return (
      <div className="glass-card p-6 sm:p-10 text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="font-display text-xl sm:text-2xl font-bold text-brand-white mb-3">Application Received!</h2>
        <p className="text-brand-silver leading-relaxed">
          Thank you for your interest in leading a UCCI chapter. Our admin team will review your application and reach out shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card p-5 sm:p-8 space-y-5">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-brand-white break-words">Apply to become a Chapter Head</h2>
      {submitError && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
        </div>
      )}
      <div>
        <label htmlFor="ch_name" className="block text-brand-silver text-sm font-medium mb-1">Full Name *</label>
        <input id="ch_name" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Enter your name" />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ch_email" className="block text-brand-silver text-sm font-medium mb-1">Email *</label>
          <input id="ch_email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="email@example.com" />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="ch_phone" className="block text-brand-silver text-sm font-medium mb-1">Phone *</label>
          <input id="ch_phone" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+91 98765 43210" />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="ch_chapter" className="block text-brand-silver text-sm font-medium mb-1">Preferred Chapter <span className="text-brand-silver/50">(optional)</span></label>
        <select id="ch_chapter" value={form.chapter_id} onChange={e => setForm(f => ({ ...f, chapter_id: e.target.value }))} className="input-field">
          <option value="">-- No preference --</option>
          {chapters.map(ch => (
            <option key={ch.id} value={ch.id}>{ch.areaName} - {ch.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="ch_message" className="block text-brand-silver text-sm font-medium mb-1">Why do you want to lead? <span className="text-brand-silver/50">(optional)</span></label>
        <textarea id="ch_message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="input-field min-h-[100px] resize-none" placeholder="Tell us about your business background and leadership experience..." />
      </div>
      <button type="button" onClick={handleSubmit} disabled={pending} className="btn-primary w-full text-base flex items-center justify-center gap-2">
        {pending ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Apply to become a Chapter Head'}
      </button>
    </div>
  )
}
