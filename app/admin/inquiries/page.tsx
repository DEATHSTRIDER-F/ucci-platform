import { createServerSupabaseClient } from '@/lib/supabase/server'
import { InquiriesClient } from '@/components/admin/InquiriesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Lead Inquiries | UCCI Admin' }

export default async function InquiriesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminProfile } = await supabase
    .from('profiles').select('id, role, chapter_id').eq('id', user!.id).single()

  const isSuperAdmin = adminProfile?.role === 'super_admin'

  let query = supabase
    .from('member_inquiries')
    .select(`*, target_member:profiles!member_inquiries_target_member_id_fkey(full_name, business_name)`)
    .order('created_at', { ascending: false })

  if (!isSuperAdmin && adminProfile?.chapter_id) {
    query = query.eq('chapter_id', adminProfile.chapter_id)
  }

  const { data: inquiries } = await query

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Lead Inquiries</h1>
      <p className="text-brand-silver mb-6">Review and mediate lead inquiries before forwarding to members.</p>
      <InquiriesClient inquiries={inquiries ?? []} adminId={adminProfile?.id ?? ''} />
    </div>
  )
}
