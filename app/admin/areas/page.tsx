import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AreasManagerClient } from '@/components/admin/AreasManagerClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Areas & Chapters | UCCI Admin' }

export default async function AreasPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'super_admin') redirect('/admin')

  const { data: areas } = await supabase
    .from('areas')
    .select('*, chapters(*)')
    .order('name')

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Areas & Chapters</h1>
      <p className="text-brand-silver mb-6">Manage geographic areas and their associated chapters.</p>
      <AreasManagerClient areas={areas ?? []} />
    </div>
  )
}
