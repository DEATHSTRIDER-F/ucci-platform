'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils/slugify'
import type { Area, Chapter } from '@/lib/types/database'

export async function createArea(data: { name: string; slug: string }): Promise<{ success: boolean; data?: Area; error?: string }> {
  if (!data.name?.trim()) return { success: false, error: 'Area name is required.' }
  const supabase = await createAdminClient()
  const { data: maxRow } = await supabase.from('areas').select('display_order').order('display_order', { ascending: false }).limit(1).maybeSingle()
  const { data: area, error } = await supabase
    .from('areas')
    .insert({ name: data.name.trim(), slug: data.slug || slugify(data.name), display_order: ((maxRow?.display_order as number | undefined) ?? -1) + 1 })
    .select().single()
  if (error) return { success: false, error: error.code === '23505' ? 'Area slug already exists.' : error.message }
  revalidatePath('/'); revalidatePath('/admin/areas')
  return { success: true, data: area }
}

export async function updateArea(id: string, data: { name: string; slug: string }): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('areas').update({ name: data.name, slug: data.slug }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/'); revalidatePath('/admin/areas')
  return { success: true }
}

export async function createChapter(data: { name: string; slug: string; area_id: string }): Promise<{ success: boolean; data?: Chapter; error?: string }> {
  if (!data.name?.trim()) return { success: false, error: 'Chapter name is required.' }
  if (!data.area_id) return { success: false, error: 'Area is required.' }
  const supabase = await createAdminClient()
  const { data: maxRow } = await supabase.from('chapters').select('display_order').eq('area_id', data.area_id).order('display_order', { ascending: false }).limit(1).maybeSingle()
  const { data: chapter, error } = await supabase
    .from('chapters')
    .insert({ name: data.name.trim(), slug: data.slug || slugify(data.name), area_id: data.area_id, display_order: ((maxRow?.display_order as number | undefined) ?? -1) + 1 })
    .select().single()
  if (error) return { success: false, error: error.code === '23505' ? 'Chapter slug already exists in this area.' : error.message }
  revalidatePath('/'); revalidatePath('/admin/areas')
  return { success: true, data: chapter }
}

export async function deleteChapter(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('chapters').delete().eq('id', id)
  if (error) return { success: false, error: error.code === '23503' ? 'Cannot delete chapter: members or admins are assigned to it.' : error.message }
  revalidatePath('/'); revalidatePath('/admin/areas')
  return { success: true }
}

export async function reorderAreas(updates: Array<{ id: string; display_order: number }>): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  await Promise.all(updates.map(u => supabase.from('areas').update({ display_order: u.display_order }).eq('id', u.id)))
  revalidatePath('/'); revalidatePath('/admin/areas')
  return { success: true }
}

export async function reorderChapters(updates: Array<{ id: string; display_order: number }>): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  await Promise.all(updates.map(u => supabase.from('chapters').update({ display_order: u.display_order }).eq('id', u.id)))
  revalidatePath('/'); revalidatePath('/admin/areas')
  return { success: true }
}

export async function toggleChapterActive(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('chapters').update({ is_active: isActive }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/'); revalidatePath('/admin/areas'); revalidatePath('/join')
  return { success: true }
}

export async function updateChapterContent(
  id: string,
  data: { info: string | null; highlights: string | null; cover_b64: string | null; remove_cover?: boolean }
): Promise<{ success: boolean; data?: Chapter; error?: string }> {
  const supabase = await createAdminClient()

  const updates: { info: string | null; highlights: string | null; cover_image_url?: string | null } = {
    info: data.info?.trim() || null,
    highlights: data.highlights?.trim() || null,
  }

  if (data.cover_b64) {
    const base64Data = data.cover_b64.split(',')[1]
    if (!base64Data) return { success: false, error: 'Invalid image data.' }
    const buffer = Buffer.from(base64Data, 'base64')
    const blob = new Blob([buffer], { type: 'image/webp' })
    const path = `chapters/${id}.webp`
    const { error: uploadError } = await supabase.storage
      .from('ucci-media')
      .upload(path, blob, { contentType: 'image/webp', upsert: true })
    if (uploadError) return { success: false, error: uploadError.message }
    const { data: urlData } = supabase.storage.from('ucci-media').getPublicUrl(path)
    updates.cover_image_url = `${urlData.publicUrl}?t=${Date.now()}`
  } else if (data.remove_cover) {
    await supabase.storage.from('ucci-media').remove([`chapters/${id}.webp`])
    updates.cover_image_url = null
  }

  const { data: chapter, error } = await supabase
    .from('chapters')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/'); revalidatePath('/admin/areas')
  return { success: true, data: chapter }
}
