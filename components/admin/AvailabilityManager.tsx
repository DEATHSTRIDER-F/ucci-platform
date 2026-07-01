'use client'

import { useState } from 'react'
import { addSlot, deleteSlot, addBlockedDate, removeBlockedDate } from '@/app/actions/availability'
import { formatDateTime } from '@/lib/utils/utils'
import { Plus, Trash2, Loader2, Calendar, Clock } from 'lucide-react'
import type { AppointmentSlot, AdminAvailability } from '@/lib/types/database'

interface AvailabilityManagerProps {
  adminId: string
  blockedDates: AdminAvailability[]
  slots: AppointmentSlot[]
}

export function AvailabilityManager({ adminId, blockedDates, slots }: AvailabilityManagerProps) {
  const [localSlots, setLocalSlots] = useState(slots)
  const [localBlocked, setLocalBlocked] = useState(blockedDates)
  const [newSlot, setNewSlot] = useState('')
  const [newBlockDate, setNewBlockDate] = useState('')
  const [newBlockStart, setNewBlockStart] = useState('')
  const [newBlockEnd, setNewBlockEnd] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddSlot = async () => {
    if (!newSlot) { setErrors({ slot: 'Please select a date and time.' }); return }
    const dt = new Date(newSlot)
    if (dt <= new Date()) { setErrors({ slot: 'Slot must be in the future.' }); return }
    setErrors({})
    setLoading('add-slot')
    const result = await addSlot({ admin_id: adminId, slot_datetime: dt.toISOString() })
    if (result.success && result.data) {
      setLocalSlots(s => [...s, result.data!].sort((a, b) => a.slot_datetime.localeCompare(b.slot_datetime)))
      setNewSlot('')
    } else {
      setErrors({ slot: result.error ?? 'Failed to add slot.' })
    }
    setLoading(null)
  }

  const handleDeleteSlot = async (slotId: string) => {
    setLoading(`del-${slotId}`)
    const result = await deleteSlot(slotId)
    if (result.success) {
      setLocalSlots(s => s.filter(sl => sl.id !== slotId))
    }
    setLoading(null)
  }

  const handleAddBlocked = async () => {
    if (!newBlockDate) { setErrors({ block: 'Please select a date.' }); return }
    setErrors({})
    setLoading('add-block')
    const result = await addBlockedDate({
      admin_id: adminId,
      blocked_date: newBlockDate,
      start_time: newBlockStart || null,
      end_time: newBlockEnd || null,
      reason: blockReason || null,
    })
    if (result.success && result.data) {
      setLocalBlocked(b => [...b, result.data!])
      setNewBlockDate(''); setNewBlockStart(''); setNewBlockEnd(''); setBlockReason('')
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
      {/* Appointment Slots */}
      <div className="space-y-4">
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-bold text-brand-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-gold" /> Add Appointment Slot
          </h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="new_slot" className="block text-brand-silver text-sm font-medium mb-1">Date & Time</label>
              <input
                id="new_slot"
                type="datetime-local"
                value={newSlot}
                onChange={e => setNewSlot(e.target.value)}
                className="input-field"
                min={new Date().toISOString().slice(0, 16)}
              />
              {errors.slot && <p className="text-red-400 text-xs mt-1">{errors.slot}</p>}
            </div>
            <button
              onClick={handleAddSlot}
              disabled={loading === 'add-slot'}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading === 'add-slot' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Slot
            </button>
          </div>
        </div>

        {/* Slots List */}
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-bold text-brand-white mb-4">
            Upcoming Slots <span className="text-brand-silver/60 font-normal text-base">({localSlots.length})</span>
          </h2>
          {localSlots.length === 0 ? (
            <p className="text-brand-silver/60 text-sm">No slots added yet.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {localSlots.map(slot => (
                <div key={slot.id} className="flex items-center justify-between gap-3 py-2 border-b border-brand-sapphire/50 last:border-0">
                  <div>
                    <div className="text-brand-white text-sm">{formatDateTime(slot.slot_datetime)}</div>
                    {slot.is_occupied && (
                      <span className="badge-warning text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Booked</span>
                    )}
                  </div>
                  {!slot.is_occupied && (
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      disabled={loading === `del-${slot.id}`}
                      className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50"
                      aria-label="Delete slot"
                    >
                      {loading === `del-${slot.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Blocked Dates */}
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="block_start" className="block text-brand-silver text-sm font-medium mb-1">Start Time <span className="text-brand-silver/50">(opt)</span></label>
                <input id="block_start" type="time" value={newBlockStart} onChange={e => setNewBlockStart(e.target.value)} className="input-field" />
              </div>
              <div>
                <label htmlFor="block_end" className="block text-brand-silver text-sm font-medium mb-1">End Time <span className="text-brand-silver/50">(opt)</span></label>
                <input id="block_end" type="time" value={newBlockEnd} onChange={e => setNewBlockEnd(e.target.value)} className="input-field" />
              </div>
            </div>
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
                      {bd.start_time ? `${bd.start_time}${bd.end_time ? ` – ${bd.end_time}` : '+'}` : 'All day'}
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
