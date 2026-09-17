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
  appointment_date: string // YYYY-MM-DD, whole-day open model
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
  if (!data.appointment_date) return { success: false, error: 'Appointment date is required.' }

  const supabase = await createAdminClient()

  // ── Resolve responsible admin + verify date is still open ────────────
  const { data: chapterAdmin } = await supabase
    .from('profiles')
    .select('id')
    .eq('chapter_id', data.chapter_id)
    .eq('role', 'chapter_admin')
    .maybeSingle()

  let adminId: string | null = chapterAdmin?.id ?? null
  if (!adminId) {
    const { data: superAdmin } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'super_admin')
      .limit(1)
      .maybeSingle()
    adminId = superAdmin?.id ?? null
  }
  if (!adminId) return { success: false, error: 'No admin available for this chapter.' }

  const { data: blocked } = await supabase
    .from('admin_availability')
    .select('id')
    .eq('admin_id', adminId)
    .eq('blocked_date', data.appointment_date)
    .maybeSingle()
  if (blocked) return { success: false, error: 'The selected date is no longer available. Please choose another date.' }

  // ── Exclusivity Check ─────────────────────────────────────
  const available = await isChapterCategoryAvailable(data.chapter_id, data.category_id)
  if (!available) {
    return { success: false, error: 'This category is already occupied in the selected chapter. Please choose a different chapter or category.' }
  }

  // ── Create + occupy appointment slot for the chosen date (11:00 local) ──
  const slotDatetime = new Date(`${data.appointment_date}T11:00:00`).toISOString()
  const { data: existing } = await supabase
    .from('appointment_slots')
    .select('id')
    .eq('admin_id', adminId)
    .eq('slot_datetime', slotDatetime)
    .eq('is_occupied', true)
    .maybeSingle()

  if (existing) {
    return { success: false, error: 'The selected date is no longer available. Please choose another date.' }
  }

  // ── Get Authenticated User ────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in to submit an application.' }
  }
  const userId = user.id

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

  // ── Update Profile Record ─────────────────────────────────
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      business_name: data.company_full_name.trim(),
      brand_tagline: data.brand_tagline?.trim() || null,
      bio: data.bio.trim(),
      phone: data.phone.trim(),
      website_url: data.website_url?.trim() || null,
      linkedin_url: data.linkedin_url?.trim() || null,
      business_address: data.business_address.trim(),
      ideal_referral_target: data.ideal_referral_target?.trim() || null,
      referral_triggers: data.referral_triggers?.trim() || null,
      ...(logoUrl ? { logo_url: logoUrl } : {}),
      chapter_id: data.chapter_id,
      category_id: data.category_id,
      status: 'pending',
      appointment_timestamp: slotDatetime,
    })
    .eq('id', userId)

  if (profileError) {
    console.error('Profile update error:', profileError)
    return { success: false, error: `Failed to update profile: ${profileError.message}` }
  }

  // ── Record the booking ──────────────────────────────────────
  const { error: slotUpdateError } = await supabase
    .from('appointment_slots')
    .upsert(
      {
        admin_id: adminId,
        slot_datetime: slotDatetime,
        is_occupied: true,
        booked_by_profile_id: userId,
      },
      { onConflict: 'admin_id,slot_datetime' }
    )

  if (slotUpdateError) {
    console.error('Slot update error:', slotUpdateError)
    // Non-fatal — profile created successfully, slot might be manually fixed
  }

  revalidatePath('/admin/applications')
  revalidatePath('/')

  return { success: true }
}
