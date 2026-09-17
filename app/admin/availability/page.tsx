import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AvailabilityManager } from '@/components/admin/AvailabilityManager'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

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

  // Fetch upcoming bookings for this admin
  const { data: bookings } = await supabase
    .from('appointment_slots')
    .select('*')
    .eq('admin_id', user!.id)
    .eq('is_occupied', true)
    .gt('slot_datetime', new Date().toISOString())
    .order('slot_datetime')
    .limit(50)

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Availability</h1>
      <p className="text-brand-silver mb-6">
        All days are open by default. Block whole days when you are unavailable — members can book any other day.
        {bookings && bookings.length > 0 ? ` You have ${bookings.length} upcoming booking(s).` : ''}
      </p>
      <AvailabilityManager
        adminId={user!.id}
        blockedDates={blocked ?? []}
      />
    </div>
  )
}

