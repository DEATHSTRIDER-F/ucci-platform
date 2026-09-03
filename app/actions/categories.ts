'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils/slugify'
import { validateCategoryInput, normalizeCategoryPayload } from '@/lib/validation/category'
import type { Category } from '@/lib/types/database'

type CategoryPayload = {
  name: string
  slug: string
  is_featured: boolean
  meta_description: string
  alt_text: string
  icon_name?: string | null
  icon_color?: string | null
}

export async function createCategory(data: CategoryPayload): Promise<{ success: boolean; data?: Category; error?: string }> {
  // Zod validation at API boundary
  const slug = data.slug?.trim() || slugify(data.name)
  const validated = validateCategoryInput({ ...data, slug })
  if (!validated.success) return { success: false, error: validated.error }

  const payload = normalizeCategoryPayload(validated.data)
  const supabase = await createAdminClient()
  const { data: cat, error } = await supabase
    .from('categories')
    .insert(payload as unknown as Record<string, unknown>)
    .select()
    .single()
  if (error) return { success: false, error: error.code === '23505' ? 'A category with this slug already exists.' : error.message }
  revalidatePath('/categories')
  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { success: true, data: cat as Category }
}

export async function updateCategory(id: string, data: CategoryPayload): Promise<{ success: boolean; data?: Category; error?: string }> {
  const slug = data.slug?.trim() || slugify(data.name)
  const validated = validateCategoryInput({ ...data, slug })
  if (!validated.success) return { success: false, error: validated.error }

  const payload = normalizeCategoryPayload(validated.data)
  const supabase = await createAdminClient()
  const { data: cat, error } = await supabase
    .from('categories')
    .update(payload as unknown as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()
  if (error) return { success: false, error: error.message }
  revalidatePath('/categories')
  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { success: true, data: cat as Category }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { success: false, error: error.code === '23503' ? 'Cannot delete category: members are using it.' : error.message }
  revalidatePath('/categories'); revalidatePath('/admin/categories')
  return { success: true }
}
