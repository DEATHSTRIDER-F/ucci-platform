'use client'

import { useState, useMemo } from 'react'
import { reviewChapterHeadApplication } from '@/app/actions/chapter-head'
import { formatDateTime } from '@/lib/utils/utils'
import { CheckCircle, XCircle, Loader2, Crown, Copy, KeyRound, Search } from 'lucide-react'
import { SearchableSelect } from '@/components/forms/SearchableSelect'
import type { ChapterHeadApplication } from '@/lib/types/database'

interface Provisioned {
  appId: string
  name: string
  email: string
  tempPassword?: string
}

export function ChapterHeadReviewClient({
  applications,
  adminId,
  chapters,
}: {
  applications: ChapterHeadApplication[]
  adminId: string
  chapters: Array<{ id: string; name: string; areaName: string }>
}) {
  const [localApps, setLocalApps] = useState(applications)
  const [loading, setLoading] = useState<Record<string, string>>({})
  const [chapterPick, setChapterPick] = useState<Record<string, string>>({})
  const [provisioned, setProvisioned] = useState<Provisioned | null>(null)
  const [copied, setCopied] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return localApps
    return localApps.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.toLowerCase().includes(q) ||
      (a.message ?? '').toLowerCase().includes(q)
    )
  }, [localApps, query])

  const handleApprove = async (app: ChapterHeadApplication) => {
    const picked = chapterPick[app.id] || app.chapter_id
    if (!picked) {
      alert('Pick a chapter for this head first, then approve.')
      return
    }
    if (!confirm(`Approve ${app.name} as chapter admin? This creates their login immediately.`)) return
    setLoading(l => ({ ...l, [app.id]: 'approved' }))
    const result = await reviewChapterHeadApplication(app.id, adminId, 'approved', picked)
    if (result.success) {
      setLocalApps(apps => apps.filter(a => a.id !== app.id))
      setProvisioned({ appId: app.id, name: app.name, email: result.email ?? app.email, tempPassword: result.tempPassword })
      setCopied(false)
    } else {
      alert(result.error)
    }
    setLoading(l => { const n = { ...l }; delete n[app.id]; return n })
  }

  const handleReject = async (id: string) => {
    if (!confirm('Reject this Start a Chapter application?')) return
    setLoading(l => ({ ...l, [id]: 'rejected' }))
    const result = await reviewChapterHeadApplication(id, adminId, 'rejected')
    if (result.success) {
      setLocalApps(apps => apps.filter(a => a.id !== id))
    } else {
      alert(result.error)
    }
    setLoading(l => { const n = { ...l }; delete n[id]; return n })
  }

  const copyCreds = async () => {
    if (!provisioned) return
    const text = provisioned.tempPassword
      ? `UCCI Chapter Head login\nEmail: ${provisioned.email}\nTemporary password: ${provisioned.tempPassword}\nLogin and change it after first sign-in.`
      : `UCCI Chapter Head login\nEmail: ${provisioned.email}\n(Existing account upgraded — they keep their current password.)`
    await navigator.clipboard.writeText(text)
    setCopied(true)
  }

  return (
    <div className="space-y-4">
      {provisioned && (
        <div className="glass-card p-6 border-green-500/40" role="status">
          <div className="flex items-start gap-3">
            <KeyRound className="w-6 h-6 text-green-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-display font-bold text-brand-white">
                {provisioned.name} is now a Chapter Head
              </h3>
              <p className="text-brand-silver text-sm mt-1">Email: <span className="text-brand-white">{provisioned.email}</span></p>
              {provisioned.tempPassword ? (
                <p className="text-brand-silver text-sm mt-1">
                  Temporary password: <code className="text-brand-gold font-mono bg-brand-navy/60 px-2 py-0.5 rounded">{provisioned.tempPassword}</code>
                </p>
              ) : (
                <p className="text-brand-silver text-sm mt-1">They already had an account — upgraded in place, existing password still works.</p>
              )}
              <p className="text-yellow-300/90 text-xs mt-2">Share these credentials directly — this is the only time the password is shown.</p>
              <div className="flex gap-2 mt-3">
                <button onClick={copyCreds} className="btn-outline text-xs py-2 px-4 inline-flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy credentials'}
                </button>
                <button onClick={() => setProvisioned(null)} className="btn-ghost text-xs">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {localApps.length === 0 && !provisioned && (
        <div className="glass-card p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-400/40 mx-auto mb-3" />
          <p className="text-brand-silver">No pending Start a Chapter applications.</p>
        </div>
      )}

      {localApps.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver/50" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name, email, phone..."
            aria-label="Search chapter head applications"
            className="input-field pl-10 text-sm"
          />
        </div>
      )}

      {filtered.map(app => (
        <div key={app.id} className="glass-card p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-brand-gold" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-display text-lg font-bold text-brand-white">{app.name}</h2>
                  <p className="text-brand-silver text-sm">{app.email} · {app.phone}</p>
                </div>
                <div className="text-right text-xs text-brand-silver/60">
                  Applied: {formatDateTime(app.created_at)}
                </div>
              </div>
              {app.chapter && <span className="badge mt-2 inline-block">Prefers: {app.chapter.name}</span>}
              {app.message && <p className="text-brand-silver text-sm mt-3">{app.message}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-brand-sapphire/50">
            <div className="min-w-52 flex-1 sm:flex-none sm:w-64">
              <SearchableSelect
                value={chapterPick[app.id] ?? app.chapter_id ?? ''}
                onChange={v => setChapterPick(p => ({ ...p, [app.id]: v }))}
                options={chapters.map(ch => ({ value: ch.id, label: `${ch.areaName} - ${ch.name}` }))}
                placeholder="-- Assign chapter --"
                ariaLabel={`Chapter for ${app.name}`}
              />
            </div>
            <button
              onClick={() => handleApprove(app)}
              disabled={!!loading[app.id]}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30 transition-all disabled:opacity-40 min-h-[44px]"
            >
              {loading[app.id] === 'approved' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve & Create Login
            </button>
            <button
              onClick={() => handleReject(app.id)}
              disabled={!!loading[app.id]}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all disabled:opacity-40 min-h-[44px]"
            >
              {loading[app.id] === 'rejected' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
