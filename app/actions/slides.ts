'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { HeroSlide } from '@/lib/types/database'

const BUCKET = 'ucci-media'

async function uploadSlideImage(b64: string, slideId: string): Promise<string | null> {
  const supabase = await createAdminClient()
  const base64Data = b64.split(',')[1]
  if (!base64Data) return null

  const buffer = Buffer.from(base64Data, 'base64')
  const blob = new Blob([buffer], { type: 'image/webp' })
  const path = `slides/${slideId}.webp`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/webp', upsert: true }) // UPSERT to avoid storage clutter

  if (error) {
    console.error('Slide image upload error:', error)
    return null
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  // Append cache-busting timestamp to force CDN refresh after upsert
  return `${data.publicUrl}?t=${Date.now()}`
}

// ─── Create Slide ──────────────────────────────────────────────────────────────
export async function createSlide(data: {
  title: string
  subtitle: string
  alt_text: string
  cta_text: string
  cta_url: string
  display_order: number
  is_active: boolean
  image_b64: string
  created_by: string
}): Promise<{ success: boolean; data?: HeroSlide; error?: string }> {
  if (!data.alt_text?.trim()) return { success: false, error: 'Alt text is required.' }
  if (!data.image_b64) return { success: false, error: 'Image is required.' }

  const supabase = await createAdminClient()

  // Insert placeholder first to get ID
  const { data: slide, error: insertError } = await supabase
    .from('hero_slides')
    .insert({
      title: data.title?.trim() || null,
      subtitle: data.subtitle?.trim() || null,
      alt_text: data.alt_text.trim(),
      cta_text: data.cta_text?.trim() || null,
      cta_url: data.cta_url?.trim() || null,
      display_order: data.display_order,
      is_active: data.is_active,
      image_url: 'placeholder',
      created_by: data.created_by,
    })
    .select()
    .single()

  if (insertError || !slide) return { success: false, error: insertError?.message ?? 'Insert failed.' }

  // Upload image with slide ID as storage path (deterministic upsert path)
  const imageUrl = await uploadSlideImage(data.image_b64, slide.id)
  if (!imageUrl) {
    await supabase.from('hero_slides').delete().eq('id', slide.id)
    return { success: false, error: 'Image upload failed.' }
  }

  const { data: updated, error: updateError } = await supabase
    .from('hero_slides')
    .update({ image_url: imageUrl })
    .eq('id', slide.id)
    .select()
    .single()

  if (updateError) return { success: false, error: updateError.message }

  revalidatePath('/')
  revalidatePath('/admin/slides')
  return { success: true, data: updated }
}

// ─── Update Slide ──────────────────────────────────────────────────────────────
export async function updateSlide(
  slideId: string,
  data: {
    title: string
    subtitle: string
    alt_text: string
    cta_text: string
    cta_url: string
    display_order: number
    is_active: boolean
    image_b64: string | null
  }
): Promise<{ success: boolean; data?: HeroSlide; error?: string }> {
  if (!data.alt_text?.trim()) return { success: false, error: 'Alt text is required.' }

  const supabase = await createAdminClient()

  const updates: Partial<HeroSlide> = {
    title: data.title?.trim() || null,
    subtitle: data.subtitle?.trim() || null,
    alt_text: data.alt_text.trim(),
    cta_text: data.cta_text?.trim() || null,
    cta_url: data.cta_url?.trim() || null,
    display_order: data.display_order,
    is_active: data.is_active,
  }

  // If new image uploaded, upsert to same storage path
  if (data.image_b64) {
    const imageUrl = await uploadSlideImage(data.image_b64, slideId)
    if (imageUrl) updates.image_url = imageUrl
  }

  const { data: updated, error } = await supabase
    .from('hero_slides')
    .update(updates)
    .eq('id', slideId)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/admin/slides')
  return { success: true, data: updated }
}

// ─── Delete Slide ──────────────────────────────────────────────────────────────
export async function deleteSlide(slideId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  // Delete from storage first (upsert means there's always exactly one file per slide)
  await supabase.storage.from(BUCKET).remove([`slides/${slideId}.webp`])

  const { error } = await supabase.from('hero_slides').delete().eq('id', slideId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/admin/slides')
  return { success: true }
}

// ─── Toggle Active ─────────────────────────────────────────────────────────────
export async function toggleSlideActive(
  slideId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('hero_slides')
    .update({ is_active: isActive })
    .eq('id', slideId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/')
  return { success: true }
}

// ─── Reorder Slides ────────────────────────────────────────────────────────────
export async function reorderSlides(
  updates: Array<{ id: string; display_order: number }>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  await Promise.all(
    updates.map(u => supabase.from('hero_slides').update({ display_order: u.display_order }).eq('id', u.id))
  )

  revalidatePath('/')
  revalidatePath('/admin/slides')
  return { success: true }
}
