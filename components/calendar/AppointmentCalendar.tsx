'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Loader2 } from 'lucide-react'

interface AppointmentCalendarProps {
  chapterId: string
  onDateSelect: (dateISO: string | null) => void
  selectedDate: string | null
}

const DAYS_AHEAD = 14

export function AppointmentCalendar({ chapterId, onDateSelect, selectedDate }: AppointmentCalendarProps) {
  const [dates, setDates] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!chapterId) {
      setDates([])
      onDateSelect(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    const fetchAvailability = async () => {
      const supabase = createClient()

      // 1. Find the chapter_head for this chapter, or fall back to super_admin
      const { data: chapterHead } = await supabase
        .from('profiles')
        .select('id')
        .eq('chapter_id', chapterId)
        .eq('role', 'chapter_head')
        .maybeSingle()

      let adminId: string | null = null
      if (chapterHead) {
        adminId = chapterHead.id
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

      // 2. Fetch whole-day blocks + already-booked dates
      const { data: blockedDates } = await supabase
        .from('admin_availability')
        .select('blocked_date')
        .eq('admin_id', adminId)

      const { data: bookedSlots } = await supabase
        .from('appointment_slots')
        .select('slot_datetime')
        .eq('admin_id', adminId)
        .eq('is_occupied', true)
        .gt('slot_datetime', new Date().toISOString())

      const blocked = new Set((blockedDates ?? []).map(b => b.blocked_date))
      const booked = new Set(
        (bookedSlots ?? []).map(s => new Date(s.slot_datetime).toISOString().split('T')[0])
      )

      // 3. Every day is available unless blocked or booked
      const open: string[] = []
      const today = new Date()
      for (let i = 1; i <= DAYS_AHEAD; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        const iso = d.toISOString().split('T')[0]
        if (!blocked.has(iso) && !booked.has(iso)) open.push(iso)
      }

      if (!cancelled) {
        setDates(open)
        setLoading(false)
      }
    }

    fetchAvailability()
    return () => { cancelled = true }
  }, [chapterId, onDateSelect])

  if (!chapterId) {
    return (
      <div className="text-center py-8 text-brand-silver/60">
        <Calendar className="w-10 h-10 mx-auto mb-2 text-brand-silver/30" />
        <p>Select a chapter to see available appointment dates.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-3 text-brand-silver">
        <Loader2 className="w-5 h-5 animate-spin text-brand-gold" />
        <span>Loading available dates...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-400 text-sm">{error}</div>
    )
  }

  if (dates.length === 0) {
    return (
      <div className="text-center py-8 text-brand-silver/60">
        <Calendar className="w-10 h-10 mx-auto mb-2 text-brand-silver/30" />
        <p>No available appointment dates at this time.</p>
        <p className="text-sm mt-1">Please check back later or contact us directly at <a href="tel:8600241900" className="text-brand-gold">8600241900</a>.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="text-brand-champagne text-sm font-semibold mb-2">Available dates (whole day open — pick one)</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {dates.map(dateISO => {
          const label = new Date(dateISO + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
          const isSelected = dateISO === selectedDate
          return (
            <button
              key={dateISO}
              type="button"
              onClick={() => onDateSelect(isSelected ? null : dateISO)}
              className={`px-4 py-3 rounded-lg text-sm font-medium border transition-all min-h-[44px] ${
                isSelected
                  ? 'bg-brand-gold text-brand-navy border-brand-gold'
                  : 'bg-brand-navy/50 text-brand-silver border-brand-sapphire hover:border-brand-gold/50 hover:text-brand-white'
              }`}
              aria-pressed={isSelected}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
