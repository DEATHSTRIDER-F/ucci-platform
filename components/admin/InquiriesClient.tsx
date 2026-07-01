'use client'

import { useState } from 'react'
import { approveLeadInquiry, rejectLeadInquiry } from '@/app/actions/inquiries'
import { formatDateTime } from '@/lib/utils/utils'
import { CheckCircle, XCircle, Loader2, MessageSquare } from 'lucide-react'
import type { MemberInquiry } from '@/lib/types/database'

interface InquiriesClientProps {
  inquiries: Array<MemberInquiry & { target_member?: { full_name: string; business_name: string | null } }>
  adminId: string
}

export function InquiriesClient({ inquiries, adminId }: InquiriesClientProps) {
  const [items, setItems] = useState(inquiries)
  const [loading, setLoading] = useState<Record<string, string>>({})

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)

  const handle = async (id: string, action: 'approve' | 'reject') => {
    setLoading(l => ({ ...l, [id]: action }))
    const fn = action === 'approve' ? approveLeadInquiry : rejectLeadInquiry
    await fn(id, adminId)
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: action === 'approve' ? 'approved' : 'rejected' } : i))
    setLoading(l => { const n = { ...l }; delete n[id]; return n })
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize min-h-[44px] ${
              filter === f ? 'bg-brand-gold text-brand-navy' : 'glass-card text-brand-silver hover:text-brand-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MessageSquare className="w-12 h-12 text-brand-silver/20 mx-auto mb-3" />
          <p className="text-brand-silver">No {filter} inquiries.</p>
        </div>
      ) : (
        filtered.map(inq => (
          <div key={inq.id} className="glass-card p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${inq.status === 'pending' ? 'badge-warning' : inq.status === 'approved' ? 'badge-success' : 'badge-error'} capitalize`}>
                    {inq.status}
                  </span>
                  <span className="text-brand-silver/60 text-xs">{formatDateTime(inq.created_at)}</span>
                </div>
                <div className="mt-1">
                  <span className="text-brand-silver text-sm">To: </span>
                  <span className="text-brand-champagne font-medium text-sm">
                    {inq.target_member?.business_name ?? inq.target_member?.full_name ?? 'Unknown Member'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-brand-silver/60 text-xs uppercase tracking-wide mb-1">From</div>
                <div className="text-brand-white font-medium">{inq.visitor_name}</div>
                <div className="text-brand-silver text-sm">{inq.visitor_email}</div>
                {inq.visitor_phone && <div className="text-brand-silver text-sm">{inq.visitor_phone}</div>}
              </div>
              <div>
                <div className="text-brand-silver/60 text-xs uppercase tracking-wide mb-1">Message</div>
                <div className="text-brand-silver text-sm leading-relaxed">{inq.message}</div>
              </div>
            </div>

            {inq.status === 'pending' && (
              <div className="flex gap-3 pt-3 border-t border-brand-sapphire/50">
                <button
                  onClick={() => handle(inq.id, 'approve')}
                  disabled={!!loading[inq.id]}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30 transition-all min-h-[44px] disabled:opacity-50"
                >
                  {loading[inq.id] === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve & Forward
                </button>
                <button
                  onClick={() => handle(inq.id, 'reject')}
                  disabled={!!loading[inq.id]}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all min-h-[44px] disabled:opacity-50"
                >
                  {loading[inq.id] === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
