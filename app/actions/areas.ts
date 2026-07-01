'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils/slugify'
import type { Area, Chapter } from '@/lib/types/database'

export async function createArea(data: { name: string; slug: string }): Promise<{ success: boolean; data?: Area; error?: string }> {
  if (!data.name?.trim()) return { success: false, error: 'Area name is required.' }
  const supabase = await createAdminClient()
  const { data: area, error } = await supabase
    .from('areas')
    .insert({ name: data.name.trim(), slug: data.slug || slugify(data.name) })
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
  const { data: chapter, error } = await supabase
    .from('chapters')
    .insert({ name: data.name.trim(), slug: data.slug || slugify(data.name), area_id: data.area_id })
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
