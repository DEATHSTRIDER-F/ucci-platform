'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireActionAuth } from '@/lib/auth/requireActionAuth'
import { revalidatePath } from 'next/cache'
import type { AppointmentSlot, AdminAvailability } from '@/lib/types/database'

// ─── Add Appointment Slot ──────────────────────────────────────────────────────
export async function addSlot(data: {
  admin_id: string
  slot_datetime: string
}): Promise<{ success: boolean; data?: AppointmentSlot; error?: string }> {
  if (!data.slot_datetime) return { success: false, error: 'Slot datetime is required.' }
  if (new Date(data.slot_datetime) <= new Date()) return { success: false, error: 'Slot must be in the future.' }

  const auth = await requireActionAuth(['super_admin', 'chapter_head'])
  if (!auth.ok) return { success: false, error: auth.error }
  // Never manage another admin's calendar
  if (auth.caller.role === 'chapter_head' && data.admin_id !== auth.caller.id) {
    return { success: false, error: 'You can only manage your own availability.' }
  }

  const supabase = await createAdminClient()
  const { data: slot, error } = await supabase
    .from('appointment_slots')
    .insert({ admin_id: data.admin_id, slot_datetime: data.slot_datetime, is_occupied: false })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { success: false, error: 'A slot already exists at this date and time.' }
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/availability')
  return { success: true, data: slot }
}

// ─── Delete Appointment Slot ───────────────────────────────────────────────────
export async function deleteSlot(slotId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  // Prevent deletion of occupied slots
  const { data: slot } = await supabase
    .from('appointment_slots')
    .select('is_occupied, admin_id')
    .eq('id', slotId)
    .single()

  if (!slot) return { success: false, error: 'Slot not found.' }

  const auth = await requireActionAuth(['super_admin', 'chapter_head'])
  if (!auth.ok) return { success: false, error: auth.error }
  if (auth.caller.role === 'chapter_head' && (slot as { admin_id?: string }).admin_id !== auth.caller.id) {
    return { success: false, error: 'You can only manage your own availability.' }
  }

  if (slot?.is_occupied) return { success: false, error: 'Cannot delete a booked slot.' }

  const { error } = await supabase.from('appointment_slots').delete().eq('id', slotId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/availability')
  return { success: true }
}

// ─── Add Blocked Date ──────────────────────────────────────────────────────────
export async function addBlockedDate(data: {
  admin_id: string
  blocked_date: string
  start_time: string | null
  end_time: string | null
  reason: string | null
}): Promise<{ success: boolean; data?: AdminAvailability; error?: string }> {
  if (!data.blocked_date) return { success: false, error: 'Date is required.' }

  const auth = await requireActionAuth(['super_admin', 'chapter_head'])
  if (!auth.ok) return { success: false, error: auth.error }
  if (auth.caller.role === 'chapter_head' && data.admin_id !== auth.caller.id) {
    return { success: false, error: 'You can only manage your own availability.' }
  }

  const supabase = await createAdminClient()
  const { data: blocked, error } = await supabase
    .from('admin_availability')
    .insert(data)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { success: false, error: 'This date/time is already blocked.' }
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/availability')
  return { success: true, data: blocked }
}

// ─── Remove Blocked Date ───────────────────────────────────────────────────────
export async function removeBlockedDate(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  const { data: blocked } = await supabase
    .from('admin_availability')
    .select('id, admin_id')
    .eq('id', id)
    .single()
  if (!blocked) return { success: false, error: 'Blocked date not found.' }

  const auth = await requireActionAuth(['super_admin', 'chapter_head'])
  if (!auth.ok) return { success: false, error: auth.error }
  if (auth.caller.role === 'chapter_head' && (blocked as { admin_id?: string }).admin_id !== auth.caller.id) {
    return { success: false, error: 'You can only manage your own availability.' }
  }

  const { error } = await supabase.from('admin_availability').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/availability')
  return { success: true }
}
