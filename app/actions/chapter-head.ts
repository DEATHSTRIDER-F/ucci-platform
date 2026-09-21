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
  status: 'approved' | 'rejected',
  chapterId?: string | null
): Promise<{ success: boolean; error?: string; tempPassword?: string; email?: string }> {
  const supabase = await createAdminClient()

  if (status === 'rejected') {
    const { error } = await supabase
      .from('chapter_head_applications')
      .update({ status, reviewed_by: adminId, reviewed_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/applications')
    return { success: true }
  }

  // ── Approve: provision chapter-head login + role ──
  const { data: app, error: appError } = await supabase
    .from('chapter_head_applications')
    .select('id, name, email, phone, chapter_id, status')
    .eq('id', id)
    .single()
  if (appError || !app) return { success: false, error: 'Application not found.' }
  if (app.status !== 'pending') return { success: false, error: 'Application already reviewed.' }

  // Reviewer's scope: chapter admins can only appoint into their own chapter
  const { data: reviewer } = await supabase
    .from('profiles')
    .select('role, chapter_id')
    .eq('id', adminId)
    .single()
  const reviewerChapter = (reviewer as { chapter_id?: string | null } | null)?.chapter_id ?? null

  const finalChapter = (chapterId || app.chapter_id) as string | null
  if (!finalChapter) return { success: false, error: 'Pick a chapter first — then approve.' }
  if (reviewerChapter && finalChapter !== reviewerChapter) {
    return { success: false, error: 'You can only appoint admins for your own chapter.' }
  }

  const email = (app.email as string).toLowerCase()

  // If the applicant already has an account (matched by email), upgrade it;
  // otherwise create a login with a generated temp password.
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', email)
    .maybeSingle()

  let tempPassword: string | undefined
  let profileId: string | null = (existing as { id?: string } | null)?.id ?? null

  if (!profileId) {
    tempPassword = crypto.randomUUID().slice(0, 12) + 'Aa1!'
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: app.name },
    })
    if (authError || !authData.user) {
      return { success: false, error: authError?.message ?? 'Failed to create login.' }
    }
    profileId = authData.user.id
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: app.name,
      phone: app.phone,
      role: 'chapter_head',
      status: 'approved',
      chapter_id: finalChapter,
      membership_fee_paid: true,
    })
    .eq('id', profileId)

  if (profileError) {
    // Roll back freshly created logins only — never delete pre-existing accounts
    if (tempPassword && profileId) await supabase.auth.admin.deleteUser(profileId)
    return { success: false, error: profileError.message }
  }

  const { error: markError } = await supabase
    .from('chapter_head_applications')
    .update({ status: 'approved', chapter_id: finalChapter, reviewed_by: adminId, reviewed_at: new Date().toISOString() })
    .eq('id', id)
  if (markError) return { success: false, error: markError.message }

  revalidatePath('/admin/applications')
  revalidatePath('/admin/admins')
  return { success: true, tempPassword, email }
}

export type { ChapterHeadApplication }
