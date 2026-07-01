import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateTime } from '@/lib/utils/utils'
import { Mail } from 'lucide-react'
import type { Metadata } from 'next'

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

      {!contacts?.length ? (
        <div className="glass-card p-12 text-center">
          <Mail className="w-12 h-12 text-brand-silver/20 mx-auto mb-3" />
          <p className="text-brand-silver">No contact inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map(c => (
            <div key={c.id} className="glass-card p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <div className="text-brand-white font-medium">{c.name}</div>
                  <a href={`mailto:${c.email}`} className="text-brand-gold text-sm hover:text-brand-champagne transition-colors">{c.email}</a>
                </div>
                <div className="text-brand-silver/60 text-xs">{formatDateTime(c.created_at)}</div>
              </div>
              {c.subject && <div className="text-brand-champagne text-sm font-medium mb-2">Re: {c.subject}</div>}
              <p className="text-brand-silver leading-relaxed">{c.message}</p>
              <div className="mt-3">
                <a
                  href={`mailto:${c.email}?subject=Re: ${c.subject ?? 'Your UCCI Inquiry'}`}
                  className="btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" /> Reply via Email
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
