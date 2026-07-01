import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AvailabilityManager } from '@/components/admin/AvailabilityManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Availability | UCCI Admin' }

export default async function AvailabilityPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch current blocked dates for this admin
  const { data: blocked } = await supabase
    .from('admin_availability')
    .select('*')
    .eq('admin_id', user!.id)
    .order('blocked_date')

  // Fetch upcoming slots for this admin
  const { data: slots } = await supabase
    .from('appointment_slots')
    .select('*')
    .eq('admin_id', user!.id)
    .gt('slot_datetime', new Date().toISOString())
    .order('slot_datetime')
    .limit(50)

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Availability & Slots</h1>
      <p className="text-brand-silver mb-6">
        Manage your appointment slots and blocked dates. Members will only see available (non-occupied) future slots.
      </p>
      <AvailabilityManager
        adminId={user!.id}
        blockedDates={blocked ?? []}
        slots={slots ?? []}
      />
    </div>
  )
}
