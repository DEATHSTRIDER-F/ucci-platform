'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils/utils'
import { Calendar, Loader2, Clock } from 'lucide-react'
import type { AppointmentSlot } from '@/lib/types/database'

interface AppointmentCalendarProps {
  chapterId: string
  onSlotSelect: (slotId: string | null) => void
  selectedSlotId: string | null
}

export function AppointmentCalendar({ chapterId, onSlotSelect, selectedSlotId }: AppointmentCalendarProps) {
  const [slots, setSlots] = useState<AppointmentSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!chapterId) {
      setSlots([])
      onSlotSelect(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    const fetchSlots = async () => {
      const supabase = createClient()

      // 1. Find the chapter_admin for this chapter, or fall back to super_admin
      const { data: chapterAdmin } = await supabase
        .from('profiles')
        .select('id')
        .eq('chapter_id', chapterId)
        .eq('role', 'chapter_admin')
        .maybeSingle()

      let adminId: string | null = null
      if (chapterAdmin) {
        adminId = chapterAdmin.id
      } else {
        const { data: superAdmin } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'super_admin')
          .maybeSingle()
        adminId = superAdmin?.id ?? null
      }

      if (!adminId) {
        if (!cancelled) {
          setError('No admin available for this chapter. Please contact us directly.')
          setLoading(false)
        }
        return
      }

      // 2. Fetch available (non-occupied) slots in future
      const now = new Date().toISOString()
      const { data: blockedDates } = await supabase
        .from('admin_availability')
        .select('blocked_date, start_time, end_time')
        .eq('admin_id', adminId)

      const { data: availableSlots, error: slotError } = await supabase
        .from('appointment_slots')
        .select('*')
        .eq('admin_id', adminId)
        .eq('is_occupied', false)
        .gt('slot_datetime', now)
        .order('slot_datetime')
        .limit(30)

      if (slotError || !availableSlots) {
        if (!cancelled) {
          setError('Failed to load available slots.')
          setLoading(false)
        }
        return
      }

      // 3. Filter out slots blocked by availability
      const filtered = availableSlots.filter(slot => {
        const slotDate = new Date(slot.slot_datetime)
        const dateStr = slotDate.toISOString().split('T')[0]

        return !(blockedDates ?? []).some(block => {
          if (block.blocked_date !== dateStr) return false
          if (!block.start_time) return true // whole day blocked
          const slotTime = slotDate.toTimeString().slice(0, 5)
          return slotTime >= block.start_time && (!block.end_time || slotTime < block.end_time)
        })
      })

      if (!cancelled) {
        setSlots(filtered)
        setLoading(false)
      }
    }

    fetchSlots()
    return () => { cancelled = true }
  }, [chapterId, onSlotSelect])

  if (!chapterId) {
    return (
      <div className="text-center py-8 text-brand-silver/60">
        <Calendar className="w-10 h-10 mx-auto mb-2 text-brand-silver/30" />
        <p>Select a chapter to see available appointment slots.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-3 text-brand-silver">
        <Loader2 className="w-5 h-5 animate-spin text-brand-gold" />
        <span>Loading available slots...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-400 text-sm">{error}</div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-brand-silver/60">
        <Clock className="w-10 h-10 mx-auto mb-2 text-brand-silver/30" />
        <p>No available appointment slots at this time.</p>
        <p className="text-sm mt-1">Please check back later or contact us directly at <a href="tel:8600241900" className="text-brand-gold">8600241900</a>.</p>
      </div>
    )
  }

  // Group by date
  const grouped: Record<string, AppointmentSlot[]> = {}
  for (const slot of slots) {
    const date = new Date(slot.slot_datetime).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(slot)
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([date, daySlots]) => (
        <div key={date}>
          <div className="text-brand-champagne text-sm font-semibold mb-2">{date}</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {daySlots.map(slot => {
              const time = new Date(slot.slot_datetime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              const isSelected = slot.id === selectedSlotId
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSlotSelect(isSelected ? null : slot.id)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium border transition-all min-h-[44px] ${
                    isSelected
                      ? 'bg-brand-gold text-brand-navy border-brand-gold'
                      : 'bg-brand-navy/50 text-brand-silver border-brand-sapphire hover:border-brand-gold/50 hover:text-brand-white'
                  }`}
                  aria-pressed={isSelected}
                >
                  {time}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
