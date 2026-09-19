'use client'

import { useState } from 'react'
import { reviewChapterHeadApplication } from '@/app/actions/chapter-head'
import { formatDateTime } from '@/lib/utils/utils'
import { CheckCircle, XCircle, Loader2, Crown } from 'lucide-react'
import type { ChapterHeadApplication } from '@/lib/types/database'

export function ChapterHeadReviewClient({
  applications,
  adminId,
}: {
  applications: ChapterHeadApplication[]
  adminId: string
}) {
  const [localApps, setLocalApps] = useState(applications)
  const [loading, setLoading] = useState<Record<string, string>>({})

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !confirm('Reject this chapter head application?')) return
    setLoading(l => ({ ...l, [id]: status }))
    const result = await reviewChapterHeadApplication(id, adminId, status)
    if (result.success) {
      setLocalApps(apps => apps.filter(a => a.id !== id))
    } else {
      alert(result.error)
    }
    setLoading(l => { const n = { ...l }; delete n[id]; return n })
  }

  if (localApps.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <CheckCircle className="w-12 h-12 text-green-400/40 mx-auto mb-3" />
        <p className="text-brand-silver">No pending chapter head applications.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {localApps.map(app => (
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
            <button
              onClick={() => handleReview(app.id, 'approved')}
              disabled={!!loading[app.id]}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30 transition-all disabled:opacity-40 min-h-[44px]"
            >
              {loading[app.id] === 'approved' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve
            </button>
            <button
              onClick={() => handleReview(app.id, 'rejected')}
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
