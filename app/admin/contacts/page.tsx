import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ContactsList } from '@/components/admin/ContactsList'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Contact Inquiries | UCCI Admin' }

export default async function ContactsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'super_admin') redirect('/admin')

  const supabaseAdmin = await import('@/lib/supabase/server').then(m => m.createAdminClient())
  const { data: contacts } = await (await supabaseAdmin)
    .from('contact_inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Contact Inquiries</h1>
      <p className="text-brand-silver mb-6">{contacts?.length ?? 0} total contact form submissions.</p>

      <ContactsList contacts={contacts ?? []} />
    </div>
  )
}

