'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitContactInquiry(data: {
  name: string
  email: string
  subject?: string
  message: string
}): Promise<{ success: boolean; error?: string }> {
  // Validate inputs
  if (!data.name?.trim()) return { success: false, error: 'Name is required.' }
  if (!data.email?.trim()) return { success: false, error: 'Email is required.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { success: false, error: 'Invalid email format.' }
  if (!data.message?.trim()) return { success: false, error: 'Message is required.' }

  // Use service role key — contact_inquiries uses public insert RLS
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('contact_inquiries')
    .insert({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject?.trim() || null,
      message: data.message.trim(),
    })

  if (error) {
    console.error('Contact inquiry error:', error)
    return { success: false, error: 'Failed to send message. Please try again.' }
  }

  revalidatePath('/admin')
  return { success: true }
}
