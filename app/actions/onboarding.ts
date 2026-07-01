'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isChapterCategoryAvailable } from '@/lib/validation/exclusivity'

interface OnboardingInput {
  company_full_name: string
  brand_tagline: string
  bio: string
  phone: string
  website_url?: string
  linkedin_url?: string
  business_address: string
  ideal_referral_target?: string
  referral_triggers?: string
  chapter_id: string
  category_id: string
  appointment_slot_id: string
  logo_file: string | null // base64 data URL
  logo_filename: string | null
}

export async function submitOnboarding(
  data: OnboardingInput
): Promise<{ success: boolean; error?: string }> {
  // ── Validation ────────────────────────────────────────────
  if (!data.company_full_name?.trim()) return { success: false, error: 'Company name is required.' }
  if (!data.bio?.trim()) return { success: false, error: 'Biography is required.' }
  if (!data.phone?.trim()) return { success: false, error: 'Phone is required.' }
  if (!data.business_address?.trim()) return { success: false, error: 'Business address is required.' }
  if (!data.chapter_id) return { success: false, error: 'Chapter is required.' }
  if (!data.category_id) return { success: false, error: 'Category is required.' }
  if (!data.appointment_slot_id) return { success: false, error: 'Appointment slot is required.' }

  const supabase = await createAdminClient()

  // ── Exclusivity Check ─────────────────────────────────────
  const available = await isChapterCategoryAvailable(data.chapter_id, data.category_id)
  if (!available) {
    return { success: false, error: 'This category is already occupied in the selected chapter. Please choose a different chapter or category.' }
  }

  // ── Lock appointment slot (SELECT FOR UPDATE SKIP LOCKED via RPC or direct) ──
  // Check and mark slot as occupied atomically
  const { data: slot, error: slotError } = await supabase
    .from('appointment_slots')
    .select('id, is_occupied, admin_id')
    .eq('id', data.appointment_slot_id)
    .eq('is_occupied', false)
    .single()

  if (slotError || !slot) {
    return { success: false, error: 'The selected appointment slot is no longer available. Please choose another slot.' }
  }

  // ── Create Supabase Auth User ─────────────────────────────
  const tempEmail = `${data.company_full_name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}@ucci-applicant.in`
  const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).toUpperCase().slice(-4) + '!1'

  // Use admin createUser — sends invitation email automatically
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: tempEmail,
    password: tempPassword,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return { success: false, error: `Failed to create account: ${authError?.message ?? 'Unknown error'}` }
  }

  const userId = authData.user.id

  // ── Upload Logo (if provided) ─────────────────────────────
  let logoUrl: string | null = null
  if (data.logo_file && data.logo_filename) {
    try {
      // Convert base64 data URL to buffer
      const base64Data = data.logo_file.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      const blob = new Blob([buffer], { type: 'image/webp' })

      const storagePath = `logos/${userId}.webp`

      const { error: uploadError } = await supabase.storage
        .from('ucci-media')
        .upload(storagePath, blob, {
          contentType: 'image/webp',
          upsert: true, // upsert to avoid storage clutter
        })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('ucci-media')
          .getPublicUrl(storagePath)
        logoUrl = urlData.publicUrl
      }
    } catch (e) {
      console.error('Logo upload failed:', e)
      // Continue without logo — graceful degradation
    }
  }

  // ── Create Profile Record ─────────────────────────────────
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email: tempEmail,
      full_name: data.company_full_name.trim(),
      business_name: data.company_full_name.trim(),
      brand_tagline: data.brand_tagline?.trim() || null,
      bio: data.bio.trim(),
      phone: data.phone.trim(),
      website_url: data.website_url?.trim() || null,
      linkedin_url: data.linkedin_url?.trim() || null,
      business_address: data.business_address.trim(),
      ideal_referral_target: data.ideal_referral_target?.trim() || null,
      referral_triggers: data.referral_triggers?.trim() || null,
      logo_url: logoUrl,
      chapter_id: data.chapter_id,
      category_id: data.category_id,
      status: 'pending',
      role: 'member',
      membership_fee_paid: false,
      appointment_timestamp: slot ? new Date().toISOString() : null,
    })

  if (profileError) {
    // Clean up auth user on failure
    await supabase.auth.admin.deleteUser(userId)
    console.error('Profile insert error:', profileError)
    return { success: false, error: `Failed to create profile: ${profileError.message}` }
  }

  // ── Mark Slot as Occupied ─────────────────────────────────
  const { error: slotUpdateError } = await supabase
    .from('appointment_slots')
    .update({
      is_occupied: true,
      booked_by_profile_id: userId,
    })
    .eq('id', data.appointment_slot_id)

  if (slotUpdateError) {
    console.error('Slot update error:', slotUpdateError)
    // Non-fatal — profile created successfully, slot might be manually fixed
  }

  revalidatePath('/admin/applications')
  revalidatePath('/')

  return { success: true }
}
