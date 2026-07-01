'use client'

import { useState } from 'react'
import { submitLeadInquiry } from '@/app/actions/inquiries'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface LeadInquiryFormProps {
  targetMemberId: string
  targetName: string
}

export function LeadInquiryForm({ targetMemberId, targetName }: LeadInquiryFormProps) {
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)
  const [form, setForm] = useState({
    visitor_name: '',
    visitor_email: '',
    visitor_phone: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.visitor_name.trim()) newErrors.visitor_name = 'Name is required'
    if (!form.visitor_email.trim()) newErrors.visitor_email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.visitor_email)) newErrors.visitor_email = 'Invalid email format'
    if (!form.message.trim()) newErrors.message = 'Message is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setPending(true)
    try {
      const res = await submitLeadInquiry({
        ...form,
        target_member_id: targetMemberId,
      })
      setResult(res)
      if (res.success) {
        setForm({ visitor_name: '', visitor_email: '', visitor_phone: '', message: '' })
      }
    } catch {
      setResult({ success: false, error: 'An unexpected error occurred. Please try again.' })
    } finally {
      setPending(false)
    }
  }

  if (result?.success) {
    return (
      <div className="flex flex-col items-center text-center py-4 gap-3">
        <CheckCircle className="w-10 h-10 text-green-400" />
        <h3 className="font-display text-lg font-semibold text-brand-white">Inquiry Sent!</h3>
        <p className="text-brand-silver text-sm">
          Your inquiry has been received. A chapter admin will review and forward it to {targetName}.
        </p>
        <button onClick={() => setResult(null)} className="btn-outline text-sm py-2 px-4 mt-2">
          Send Another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {result?.error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {result.error}
        </div>
      )}

      <div>
        <label htmlFor="visitor_name" className="block text-brand-silver text-sm font-medium mb-1">Your Name *</label>
        <input
          id="visitor_name"
          type="text"
          value={form.visitor_name}
          onChange={e => setForm(f => ({ ...f, visitor_name: e.target.value }))}
          className="input-field"
          placeholder="John Doe"
          required
          aria-describedby={errors.visitor_name ? 'name-error' : undefined}
        />
        {errors.visitor_name && <p id="name-error" className="text-red-400 text-xs mt-1">{errors.visitor_name}</p>}
      </div>

      <div>
        <label htmlFor="visitor_email" className="block text-brand-silver text-sm font-medium mb-1">Email Address *</label>
        <input
          id="visitor_email"
          type="email"
          value={form.visitor_email}
          onChange={e => setForm(f => ({ ...f, visitor_email: e.target.value }))}
          className="input-field"
          placeholder="john@company.com"
          required
          aria-describedby={errors.visitor_email ? 'email-error' : undefined}
        />
        {errors.visitor_email && <p id="email-error" className="text-red-400 text-xs mt-1">{errors.visitor_email}</p>}
      </div>

      <div>
        <label htmlFor="visitor_phone" className="block text-brand-silver text-sm font-medium mb-1">Phone <span className="text-brand-silver/50">(optional)</span></label>
        <input
          id="visitor_phone"
          type="tel"
          value={form.visitor_phone}
          onChange={e => setForm(f => ({ ...f, visitor_phone: e.target.value }))}
          className="input-field"
          placeholder="+91 98765 43210"
        />
      </div>

      <div>
        <label htmlFor="inq_message" className="block text-brand-silver text-sm font-medium mb-1">Message *</label>
        <textarea
          id="inq_message"
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          className="input-field min-h-[100px] resize-none"
          placeholder="Describe your requirement or how you'd like to connect..."
          required
          aria-describedby={errors.message ? 'msg-error' : undefined}
        />
        {errors.message && <p id="msg-error" className="text-red-400 text-xs mt-1">{errors.message}</p>}
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full flex items-center justify-center gap-2">
        {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Inquiry'}
      </button>

      <p className="text-brand-silver/50 text-xs text-center">
        Your inquiry will be reviewed by a chapter admin before being forwarded.
      </p>
    </form>
  )
}
