'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Submit Lead Inquiry (Public) ─────────────────────────────────────────────
export async function submitLeadInquiry(data: {
  visitor_name: string
  visitor_email: string
  visitor_phone?: string
  message: string
  target_member_id: string
}): Promise<{ success: boolean; error?: string }> {
  // Validate inputs
  if (!data.visitor_name?.trim()) return { success: false, error: 'Name is required.' }
  if (!data.visitor_email?.trim()) return { success: false, error: 'Email is required.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.visitor_email)) return { success: false, error: 'Invalid email format.' }
  if (!data.message?.trim()) return { success: false, error: 'Message is required.' }
  if (!data.target_member_id?.trim()) return { success: false, error: 'Invalid target member.' }

  // Use service role key to look up the member's chapter (bypasses RLS)
  const supabase = await createAdminClient()

  const { data: member, error: memberError } = await supabase
    .from('profiles')
    .select('id, chapter_id')
    .eq('id', data.target_member_id)
    .eq('status', 'approved')
    .single()

  if (memberError || !member) {
    return { success: false, error: 'Member not found.' }
  }

  if (!member.chapter_id) {
    return { success: false, error: 'Member has no chapter assigned.' }
  }

  const { error } = await supabase
    .from('member_inquiries')
    .insert({
      target_member_id: data.target_member_id,
      chapter_id: member.chapter_id,
      visitor_name: data.visitor_name.trim(),
      visitor_email: data.visitor_email.trim().toLowerCase(),
      visitor_phone: data.visitor_phone?.trim() || null,
      message: data.message.trim(),
      status: 'pending',
    })

  if (error) {
    console.error('Inquiry insert error:', error)
    return { success: false, error: 'Failed to submit inquiry. Please try again.' }
  }

  revalidatePath('/admin/inquiries')
  return { success: true }
}

// ─── Approve Lead Inquiry (Admin) ─────────────────────────────────────────────
export async function approveLeadInquiry(
  inquiryId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  if (!inquiryId) return { success: false, error: 'Invalid inquiry ID.' }

  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('member_inquiries')
    .update({
      status: 'approved',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', inquiryId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/inquiries')
  return { success: true }
}

// ─── Reject Lead Inquiry (Admin) ──────────────────────────────────────────────
export async function rejectLeadInquiry(
  inquiryId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  if (!inquiryId) return { success: false, error: 'Invalid inquiry ID.' }

  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('member_inquiries')
    .update({
      status: 'rejected',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', inquiryId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/inquiries')
  return { success: true }
}
