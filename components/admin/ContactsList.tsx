'use client'

import { useState, useMemo } from 'react'
import { formatDateTime } from '@/lib/utils/utils'
import { Mail, Search } from 'lucide-react'
import type { ContactInquiry } from '@/lib/types/database'

export function ContactsList({ contacts }: { contacts: ContactInquiry[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.subject ?? '').toLowerCase().includes(q) ||
      c.message.toLowerCase().includes(q)
    )
  }, [contacts, query])

  if (!contacts.length) {
    return (
      <div className="glass-card p-12 text-center">
        <Mail className="w-12 h-12 text-brand-silver/20 mx-auto mb-3" />
        <p className="text-brand-silver">No contact inquiries yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver/50" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search name, email, subject, message..."
          aria-label="Search contact inquiries"
          className="input-field pl-10 text-sm"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-brand-silver">No inquiries match your search.</p>
        </div>
      ) : (
        filtered.map(c => (
          <div key={c.id} className="glass-card p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <div>
                <div className="text-brand-white font-medium">{c.name}</div>
                <a href={`mailto:${c.email}`} className="text-brand-gold text-sm hover:text-brand-champagne transition-colors">{c.email}</a>
              </div>
              <div className="text-brand-silver/60 text-xs">{formatDateTime(c.created_at)}</div>
            </div>
            {c.subject && <div className="text-brand-champagne text-sm font-medium mb-2">Re: {c.subject}</div>}
            <p className="text-brand-silver leading-relaxed">{c.message}</p>
            <div className="mt-3">
              <a
                href={`mailto:${c.email}?subject=Re: ${c.subject ?? 'Your UCCI Inquiry'}`}
                className="btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1"
              >
                <Mail className="w-3 h-3" /> Reply via Email
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
