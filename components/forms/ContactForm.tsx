'use client'

import { useState } from 'react'
import { submitContactInquiry } from '@/app/actions/contact'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export function ContactForm() {
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format'
    if (!form.message.trim()) e.message = 'Message is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setPending(true)
    try {
      const res = await submitContactInquiry(form)
      setResult(res)
      if (res.success) setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      setResult({ success: false, error: 'An unexpected error occurred.' })
    } finally {
      setPending(false)
    }
  }

  if (result?.success) {
    return (
      <div className="flex flex-col items-center text-center py-8 gap-3">
        <CheckCircle className="w-12 h-12 text-green-400" />
        <h3 className="font-display text-xl font-bold text-brand-white">Message Sent!</h3>
        <p className="text-brand-silver">Thank you for reaching out. We&apos;ll get back to you shortly.</p>
        <button onClick={() => setResult(null)} className="btn-outline py-2 px-4 text-sm mt-2">Send Another</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {result?.error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {result.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact_name" className="block text-brand-silver text-sm font-medium mb-1">Full Name *</label>
          <input id="contact_name" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Your name" required />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="contact_email" className="block text-brand-silver text-sm font-medium mb-1">Email Address *</label>
          <input id="contact_email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="you@company.com" required />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="contact_subject" className="block text-brand-silver text-sm font-medium mb-1">Subject <span className="text-brand-silver/50">(optional)</span></label>
        <input id="contact_subject" type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-field" placeholder="How can we help?" />
      </div>

      <div>
        <label htmlFor="contact_message" className="block text-brand-silver text-sm font-medium mb-1">Message *</label>
        <textarea id="contact_message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="input-field min-h-[140px] resize-none" placeholder="Tell us about your inquiry..." required />
        {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full flex items-center justify-center gap-2">
        {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Message'}
      </button>
    </form>
  )
}
