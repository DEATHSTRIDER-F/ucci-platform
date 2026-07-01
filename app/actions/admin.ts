'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isChapterCategoryAvailable } from '@/lib/validation/exclusivity'

// ─── Toggle Membership Fee ─────────────────────────────────────────────────────
export async function toggleMembershipFee(
  profileId: string,
  paid: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ membership_fee_paid: paid })
    .eq('id', profileId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/applications')
  return { success: true }
}

// ─── Approve Application ──────────────────────────────────────────────────────
export async function approveApplication(
  profileId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  // Verify membership fee is paid
  const { data: profile } = await supabase
    .from('profiles')
    .select('membership_fee_paid, chapter_id, category_id')
    .eq('id', profileId)
    .single()

  if (!profile) return { success: false, error: 'Profile not found.' }
  if (!profile.membership_fee_paid) {
    return { success: false, error: 'Membership fee must be confirmed before approval.' }
  }

  // Re-check exclusivity before approving
  if (profile.chapter_id && profile.category_id) {
    const available = await isChapterCategoryAvailable(profile.chapter_id, profile.category_id, profileId)
    if (!available) {
      return { success: false, error: 'Chapter-category exclusivity conflict. Another member was approved in this slot.' }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'approved' })
    .eq('id', profileId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/applications')
  revalidatePath('/')
  revalidatePath('/categories')
  return { success: true }
}

// ─── Reject Application ───────────────────────────────────────────────────────
export async function rejectApplication(
  profileId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  // Release the appointment slot
  const { data: slot } = await supabase
    .from('appointment_slots')
    .select('id')
    .eq('booked_by_profile_id', profileId)
    .single()

  if (slot) {
    await supabase
      .from('appointment_slots')
      .update({ is_occupied: false, booked_by_profile_id: null })
      .eq('id', slot.id)
  }

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'rejected' })
    .eq('id', profileId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/applications')
  return { success: true }
}

// ─── Create Chapter Admin ──────────────────────────────────────────────────────
export async function createChapterAdmin(data: {
  email: string
  full_name: string
  chapter_id: string
  password: string
}): Promise<{ success: boolean; error?: string }> {
  if (!data.email || !data.full_name || !data.chapter_id || !data.password) {
    return { success: false, error: 'All fields are required.' }
  }

  const supabase = await createAdminClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return { success: false, error: authError?.message ?? 'Failed to create user.' }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email: data.email,
      full_name: data.full_name,
      role: 'chapter_admin',
      status: 'approved',
      chapter_id: data.chapter_id,
      membership_fee_paid: true,
    })

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { success: false, error: profileError.message }
  }

  revalidatePath('/admin/admins')
  return { success: true }
}

// ─── Delete Chapter Admin ──────────────────────────────────────────────────────
export async function deleteChapterAdmin(profileId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(profileId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/admins')
  return { success: true }
}
