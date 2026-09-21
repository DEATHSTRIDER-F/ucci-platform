'use server'

import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Update Own Profile (members editing themselves) ─────────────────────────
// Chapter, category, role, and status are NEVER taken from input —
// they are stripped server-side even if a crafted request sends them.
export async function updateOwnProfile(data: {
  full_name: string
  business_name: string
  brand_tagline?: string | null
  bio?: string | null
  phone: string
  website_url?: string | null
  linkedin_url?: string | null
  business_address: string
  ideal_referral_target?: string | null
  referral_triggers?: string | null
  logo_file?: string | null // base64 data URL (optional)
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in.' }

  if (!data.full_name?.trim()) return { success: false, error: 'Full name is required.' }
  if (!data.business_name?.trim()) return { success: false, error: 'Business name is required.' }
  if (!data.phone?.trim()) return { success: false, error: 'Phone is required.' }
  if (!data.business_address?.trim()) return { success: false, error: 'Business address is required.' }
  if (data.website_url && !/^https?:\/\/.+/.test(data.website_url)) return { success: false, error: 'Website must be a valid URL.' }

  const admin = await createAdminClient()

  let logoUrl: string | undefined
  if (data.logo_file) {
    try {
      const base64Data = data.logo_file.split(',')[1]
      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64')
        const blob = new Blob([buffer], { type: 'image/webp' })
        const storagePath = `logos/${user.id}.webp`
        const { error: uploadError } = await admin.storage
          .from('ucci-media')
          .upload(storagePath, blob, { contentType: 'image/webp', upsert: true })
        if (!uploadError) {
          logoUrl = admin.storage.from('ucci-media').getPublicUrl(storagePath).data.publicUrl
        }
      }
    } catch (e) {
      console.error('Profile logo upload failed:', e)
    }
  }

  const { error } = await admin
    .from('profiles')
    .update({
      full_name: data.full_name.trim(),
      business_name: data.business_name.trim(),
      brand_tagline: data.brand_tagline?.trim() || null,
      bio: data.bio?.trim() || null,
      phone: data.phone.trim(),
      website_url: data.website_url?.trim() || null,
      linkedin_url: data.linkedin_url?.trim() || null,
      business_address: data.business_address.trim(),
      ideal_referral_target: data.ideal_referral_target?.trim() || null,
      referral_triggers: data.referral_triggers?.trim() || null,
      ...(logoUrl ? { logo_url: logoUrl } : {}),
      // NOTE: chapter_id, category_id, role, status deliberately absent
    })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/profile')
  revalidatePath(`/members/${user.id}`)
  revalidatePath('/')
  return { success: true }
}
