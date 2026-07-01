'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils/slugify'
import type { Category } from '@/lib/types/database'

export async function createCategory(data: {
  name: string; slug: string; is_featured: boolean; meta_description: string; alt_text: string
}): Promise<{ success: boolean; data?: Category; error?: string }> {
  if (!data.name?.trim()) return { success: false, error: 'Name is required.' }
  const supabase = await createAdminClient()
  const slug = data.slug?.trim() || slugify(data.name)
  const { data: cat, error } = await supabase
    .from('categories')
    .insert({ name: data.name.trim(), slug, is_featured: data.is_featured, meta_description: data.meta_description?.trim() || null, alt_text: data.alt_text?.trim() || null })
    .select().single()
  if (error) return { success: false, error: error.code === '23505' ? 'A category with this slug already exists.' : error.message }
  revalidatePath('/categories'); revalidatePath('/admin/categories')
  return { success: true, data: cat }
}

export async function updateCategory(id: string, data: {
  name: string; slug: string; is_featured: boolean; meta_description: string; alt_text: string
}): Promise<{ success: boolean; data?: Category; error?: string }> {
  if (!data.name?.trim()) return { success: false, error: 'Name is required.' }
  const supabase = await createAdminClient()
  const { data: cat, error } = await supabase
    .from('categories')
    .update({ name: data.name.trim(), slug: data.slug?.trim() || slugify(data.name), is_featured: data.is_featured, meta_description: data.meta_description?.trim() || null, alt_text: data.alt_text?.trim() || null })
    .eq('id', id).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath('/categories'); revalidatePath('/admin/categories')
  return { success: true, data: cat }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { success: false, error: error.code === '23503' ? 'Cannot delete category: members are using it.' : error.message }
  revalidatePath('/categories'); revalidatePath('/admin/categories')
  return { success: true }
}
