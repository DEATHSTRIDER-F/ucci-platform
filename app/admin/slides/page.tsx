import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SlidesManagerClient } from '@/components/admin/SlidesManagerClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Hero Slides | UCCI Admin' }

export default async function SlidesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminProfile } = await supabase
    .from('profiles').select('id, role').eq('id', user!.id).single()

  // Only super_admin
  if (adminProfile?.role !== 'super_admin') redirect('/admin')

  // Use service-role client to fetch ALL slides including inactive ones
  const adminClient = await createAdminClient()
  const { data: slides } = await adminClient
    .from('hero_slides')
    .select('*')
    .order('display_order')

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Hero Carousel Slides</h1>
      <p className="text-brand-silver mb-6">
        Manage the homepage hero carousel. Images are automatically compressed to WebP and stored via upsert.
      </p>
      <SlidesManagerClient slides={slides ?? []} adminId={adminProfile.id} />
    </div>
  )
}
