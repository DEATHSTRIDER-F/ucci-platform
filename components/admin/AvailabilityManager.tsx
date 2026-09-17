'use client'

import { useState } from 'react'
import { addBlockedDate, removeBlockedDate } from '@/app/actions/availability'
import { Plus, Trash2, Loader2, Calendar } from 'lucide-react'
import type { AdminAvailability } from '@/lib/types/database'

interface AvailabilityManagerProps {
  adminId: string
  blockedDates: AdminAvailability[]
  slots?: never
}

export function AvailabilityManager({ adminId, blockedDates }: AvailabilityManagerProps) {
  const [localBlocked, setLocalBlocked] = useState(blockedDates)
  const [newBlockDate, setNewBlockDate] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddBlocked = async () => {
    if (!newBlockDate) { setErrors({ block: 'Please select a date.' }); return }
    setErrors({})
    setLoading('add-block')
    const result = await addBlockedDate({
      admin_id: adminId,
      blocked_date: newBlockDate,
      start_time: null,
      end_time: null,
      reason: blockReason || null,
    })
    if (result.success && result.data) {
      setLocalBlocked(b => [...b, result.data!])
      setNewBlockDate(''); setBlockReason('')
    } else {
      setErrors({ block: result.error ?? 'Failed to add blocked date.' })
    }
    setLoading(null)
  }

  const handleRemoveBlocked = async (id: string) => {
    setLoading(`del-block-${id}`)
    const result = await removeBlockedDate(id)
    if (result.success) {
      setLocalBlocked(b => b.filter(bd => bd.id !== id))
    }
    setLoading(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Block a Date */}
      <div className="space-y-4">
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-bold text-brand-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-gold" /> Block a Date
          </h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="block_date" className="block text-brand-silver text-sm font-medium mb-1">Date *</label>
              <input id="block_date" type="date" value={newBlockDate} onChange={e => setNewBlockDate(e.target.value)} className="input-field" min={new Date().toISOString().split('T')[0]} />
            </div>
            <p className="text-brand-silver/60 text-xs -mt-1">Whole day will be blocked — all dates are otherwise available unless booked.</p>
            <div>
              <label htmlFor="block_reason" className="block text-brand-silver text-sm font-medium mb-1">Reason <span className="text-brand-silver/50">(optional)</span></label>
              <input id="block_reason" type="text" value={blockReason} onChange={e => setBlockReason(e.target.value)} className="input-field" placeholder="Holiday, Out of office..." />
            </div>
            {errors.block && <p className="text-red-400 text-xs">{errors.block}</p>}
            <button onClick={handleAddBlocked} disabled={loading === 'add-block'} className="btn-outline w-full flex items-center justify-center gap-2">
              {loading === 'add-block' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Block Date
            </button>
          </div>
        </div>

        {/* Blocked Dates List */}
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-bold text-brand-white mb-4">
            Blocked Dates <span className="text-brand-silver/60 font-normal text-base">({localBlocked.length})</span>
          </h2>
          {localBlocked.length === 0 ? (
            <p className="text-brand-silver/60 text-sm">No blocked dates.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {localBlocked.map(bd => (
                <div key={bd.id} className="flex items-center justify-between gap-3 py-2 border-b border-brand-sapphire/50 last:border-0">
                  <div>
                    <div className="text-brand-white text-sm">{bd.blocked_date}</div>
                    <div className="text-brand-silver/60 text-xs">
                      All day
                      {bd.reason && ` · ${bd.reason}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveBlocked(bd.id)}
                    disabled={loading === `del-block-${bd.id}`}
                    className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50"
                    aria-label="Remove blocked date"
                  >
                    {loading === `del-block-${bd.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
