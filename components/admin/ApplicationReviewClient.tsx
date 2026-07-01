'use client'

import { useState } from 'react'
import { approveApplication, rejectApplication, toggleMembershipFee } from '@/app/actions/admin'
import { formatDateTime } from '@/lib/utils/utils'
import { CheckCircle, XCircle, DollarSign, User, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ApplicationItem {
  id: string
  full_name: string
  email: string
  business_name: string | null
  brand_tagline: string | null
  bio: string | null
  logo_url: string | null
  phone: string | null
  membership_fee_paid: boolean
  created_at: string
  chapter?: { name: string; area?: { name: string } } | null
  category?: { name: string } | null
}

interface ApplicationReviewClientProps {
  applications: ApplicationItem[]
  adminId: string
}

export function ApplicationReviewClient({ applications, adminId }: ApplicationReviewClientProps) {
  const [loading, setLoading] = useState<Record<string, string>>({})
  const [localApps, setLocalApps] = useState(applications)

  const handleFeeToggle = async (profileId: string, current: boolean) => {
    setLoading(l => ({ ...l, [profileId]: 'fee' }))
    await toggleMembershipFee(profileId, !current)
    setLocalApps(apps => apps.map(a => a.id === profileId ? { ...a, membership_fee_paid: !current } : a))
    setLoading(l => { const n = { ...l }; delete n[profileId]; return n })
  }

  const handleApprove = async (profileId: string) => {
    const app = localApps.find(a => a.id === profileId)
    if (!app?.membership_fee_paid) {
      alert('Membership fee must be confirmed before approval.')
      return
    }
    setLoading(l => ({ ...l, [profileId]: 'approve' }))
    const result = await approveApplication(profileId)
    if (result.success) {
      setLocalApps(apps => apps.filter(a => a.id !== profileId))
    } else {
      alert(result.error)
    }
    setLoading(l => { const n = { ...l }; delete n[profileId]; return n })
  }

  const handleReject = async (profileId: string) => {
    if (!confirm('Are you sure you want to reject this application? This action cannot be undone.')) return
    setLoading(l => ({ ...l, [profileId]: 'reject' }))
    await rejectApplication(profileId)
    setLocalApps(apps => apps.filter(a => a.id !== profileId))
    setLoading(l => { const n = { ...l }; delete n[profileId]; return n })
  }

  if (localApps.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <CheckCircle className="w-12 h-12 text-green-400/40 mx-auto mb-3" />
        <p className="text-brand-silver">No pending applications. All caught up!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {localApps.map(app => (
        <div key={app.id} className="glass-card p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-brand-gold/30 flex-shrink-0">
              {app.logo_url ? (
                <Image src={app.logo_url} alt={app.business_name ?? app.full_name} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full bg-brand-gold/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-brand-gold" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-display text-lg font-bold text-brand-white">{app.business_name ?? app.full_name}</h2>
                  <p className="text-brand-silver text-sm">{app.email}</p>
                  {app.brand_tagline && <p className="text-brand-champagne/80 text-sm italic mt-0.5">{app.brand_tagline}</p>}
                </div>
                <div className="text-right text-xs text-brand-silver/60">
                  Applied: {formatDateTime(app.created_at)}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-3">
                {app.category && <span className="badge">{app.category.name}</span>}
                {app.chapter && (
                  <span className="badge">
                    {app.chapter.name} · {app.chapter.area?.name}
                  </span>
                )}
                {app.phone && <span className="text-brand-silver/60 text-xs">{app.phone}</span>}
              </div>

              {app.bio && <p className="text-brand-silver text-sm mt-3 line-clamp-2">{app.bio}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-brand-sapphire/50">
            {/* Fee Toggle */}
            <button
              onClick={() => handleFeeToggle(app.id, app.membership_fee_paid)}
              disabled={!!loading[app.id]}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all min-h-[44px] ${
                app.membership_fee_paid
                  ? 'bg-green-500/20 border-green-500/40 text-green-300'
                  : 'bg-brand-navy/50 border-brand-silver/30 text-brand-silver hover:border-brand-gold/50'
              }`}
            >
              {loading[app.id] === 'fee' ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              {app.membership_fee_paid ? '₹10,000 Paid ✓' : 'Mark Fee Paid'}
            </button>

            <button
              onClick={() => handleApprove(app.id)}
              disabled={!!loading[app.id] || !app.membership_fee_paid}
              title={!app.membership_fee_paid ? 'Confirm fee payment first' : 'Approve this application'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
            >
              {loading[app.id] === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve
            </button>

            <button
              onClick={() => handleReject(app.id)}
              disabled={!!loading[app.id]}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all disabled:opacity-40 min-h-[44px]"
            >
              {loading[app.id] === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
