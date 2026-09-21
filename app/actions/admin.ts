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
  admin_chapter_id?: string | null // chapter scope when added by a chapter_head
  logo_file?: string | null // base64 data URL (optional)
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

  // Upload logo (optional — graceful degradation like onboarding)
  let logoUrl: string | null = null
  if (data.logo_file) {
    try {
      const base64Data = data.logo_file.split(',')[1]
      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64')
        const blob = new Blob([buffer], { type: 'image/webp' })
        const storagePath = `logos/${authData.user.id}.webp`
        const { error: uploadError } = await supabase.storage
          .from('ucci-media')
          .upload(storagePath, blob, { contentType: 'image/webp', upsert: true })
        if (!uploadError) {
          logoUrl = supabase.storage.from('ucci-media').getPublicUrl(storagePath).data.publicUrl
        }
      }
    } catch (e) {
      console.error('Member logo upload failed:', e)
    }
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
      ...(logoUrl ? { logo_url: logoUrl } : {}),
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

// ─── Update Member Logo ──────────────────────────────────────────────────────
// Lets an admin set/replace the photo for any approved member.
export async function updateMemberLogo(
  profileId: string,
  logoFile: string | null
): Promise<{ success: boolean; data?: string; error?: string }> {
  const supabase = await createAdminClient()

  if (!logoFile) {
    const { error } = await supabase.from('profiles').update({ logo_url: null }).eq('id', profileId)
    if (error) return { success: false, error: error.message }
    await supabase.storage.from('ucci-media').remove([`logos/${profileId}.webp`])
    revalidatePath(`/admin/members/${profileId}`)
    revalidatePath(`/members/${profileId}`)
    return { success: true, data: '' }
  }

  const base64Data = logoFile.split(',')[1]
  if (!base64Data) return { success: false, error: 'Invalid image data.' }
  const buffer = Buffer.from(base64Data, 'base64')
  const blob = new Blob([buffer], { type: 'image/webp' })
  const storagePath = `logos/${profileId}.webp`

  const { error: uploadError } = await supabase.storage
    .from('ucci-media')
    .upload(storagePath, blob, { contentType: 'image/webp', upsert: true })
  if (uploadError) return { success: false, error: uploadError.message }

  const logoUrl = supabase.storage.from('ucci-media').getPublicUrl(storagePath).data.publicUrl
  const { error } = await supabase.from('profiles').update({ logo_url: logoUrl }).eq('id', profileId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/admin/members/${profileId}`)
  revalidatePath(`/members/${profileId}`)
  revalidatePath('/')
  return { success: true, data: logoUrl }
}

// ─── Assign Chapter Head (promote an approved member of that chapter) ────────
export async function assignChapterHead(
  chapterId: string,
  profileId: string
): Promise<{ success: boolean; error?: string }> {
  if (!chapterId || !profileId) return { success: false, error: 'Chapter and member are required.' }
  const supabase = await createAdminClient()

  const { data: member } = await supabase
    .from('profiles')
    .select('id, role, status, chapter_id')
    .eq('id', profileId)
    .single()
  if (!member) return { success: false, error: 'Member not found.' }
  if (member.status !== 'approved' || member.role !== 'member') {
    return { success: false, error: 'Only approved members can be promoted to chapter head.' }
  }
  if (member.chapter_id !== chapterId) {
    return { success: false, error: 'Member must belong to this chapter.' }
  }

  // Demote any existing head of this chapter back to member (keeps listing)
  await supabase
    .from('profiles')
    .update({ role: 'member' })
    .eq('chapter_id', chapterId)
    .eq('role', 'chapter_head')

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'chapter_head' })
    .eq('id', profileId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/chapter-heads')
  return { success: true }
}

// ─── Remove Chapter Head (demote to member — listing and login kept) ─────────
export async function demoteChapterHead(profileId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'member' })
    .eq('id', profileId)
    .eq('role', 'chapter_head')
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/chapter-heads')
  return { success: true }
}
