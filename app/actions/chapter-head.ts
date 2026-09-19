'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ChapterHeadApplication } from '@/lib/types/database'

export async function submitChapterHeadApplication(data: {
  name: string
  email: string
  phone: string
  chapter_id: string | null
  message: string | null
}): Promise<{ success: boolean; error?: string }> {
  const name = data.name?.trim()
  const email = data.email?.trim().toLowerCase()
  const phone = data.phone?.trim()
  if (!name) return { success: false, error: 'Name is required.' }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: 'Valid email is required.' }
  if (!phone) return { success: false, error: 'Phone is required.' }

  const supabase = await createAdminClient()
  const { error } = await supabase.from('chapter_head_applications').insert({
    name,
    email,
    phone,
    chapter_id: data.chapter_id || null,
    message: data.message?.trim() || null,
    status: 'pending',
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/applications')
  return { success: true }
}

export async function reviewChapterHeadApplication(
  id: string,
  adminId: string,
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('chapter_head_applications')
    .update({ status, reviewed_by: adminId, reviewed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/applications')
  return { success: true }
}

export type { ChapterHeadApplication }
