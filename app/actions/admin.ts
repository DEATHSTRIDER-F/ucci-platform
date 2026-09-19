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
    .update({
      full_name: data.full_name,
      role: 'chapter_admin',
      status: 'approved',
      chapter_id: data.chapter_id,
      membership_fee_paid: true,
    })
    .eq('id', authData.user.id)

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { success: false, error: profileError.message }
  }

  revalidatePath('/admin/admins')
  return { success: true }
}

// ─── Add Member (Off-site / Offline Application) ─────────────────────────────
// Admin manually adds a member who applied offline. Creates a login account
// and an immediately-approved profile — no interview slot needed.
export async function createMemberOffline(data: {
  email: string
  password: string
  full_name: string
  phone: string
  business_name: string
  brand_tagline?: string | null
  bio?: string | null
  business_address: string
  website_url?: string | null
  linkedin_url?: string | null
  chapter_id: string
  category_id: string
  membership_fee_paid: boolean
  admin_chapter_id?: string | null // chapter scope when added by a chapter_admin
}): Promise<{ success: boolean; error?: string }> {
  const email = data.email?.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: 'Valid email is required.' }
  if (!data.password || data.password.length < 8) return { success: false, error: 'Temporary password must be at least 8 characters.' }
  if (!data.full_name?.trim()) return { success: false, error: 'Full name is required.' }
  if (!data.phone?.trim()) return { success: false, error: 'Phone is required.' }
  if (!data.business_name?.trim()) return { success: false, error: 'Business name is required.' }
  if (!data.business_address?.trim()) return { success: false, error: 'Business address is required.' }
  if (!data.chapter_id) return { success: false, error: 'Chapter is required.' }
  if (!data.category_id) return { success: false, error: 'Category is required.' }

  // Chapter admins can only add to their own chapter
  if (data.admin_chapter_id && data.chapter_id !== data.admin_chapter_id) {
    return { success: false, error: 'You can only add members to your own chapter.' }
  }

  const supabase = await createAdminClient()

  // Enforce chapter-category exclusivity like the normal flow
  const available = await isChapterCategoryAvailable(data.chapter_id, data.category_id)
  if (!available) {
    return { success: false, error: 'This category is already occupied in the selected chapter.' }
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: data.password,
    email_confirm: true,
    user_metadata: { full_name: data.full_name.trim() },
  })

  if (authError || !authData.user) {
    return { success: false, error: authError?.message ?? 'Failed to create user.' }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name.trim(),
      role: 'member',
      status: 'approved',
      phone: data.phone.trim(),
      business_name: data.business_name.trim(),
      brand_tagline: data.brand_tagline?.trim() || null,
      bio: data.bio?.trim() || null,
      business_address: data.business_address.trim(),
      website_url: data.website_url?.trim() || null,
      linkedin_url: data.linkedin_url?.trim() || null,
      chapter_id: data.chapter_id,
      category_id: data.category_id,
      membership_fee_paid: data.membership_fee_paid,
    })
    .eq('id', authData.user.id)

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { success: false, error: profileError.message }
  }

  revalidatePath('/admin/members')
  revalidatePath('/')
  revalidatePath('/categories')
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
