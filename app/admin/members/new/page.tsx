export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddMemberForm } from '@/components/admin/AddMemberForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add Member | UCCI Admin' }

export default async function NewMemberPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, chapter_id')
    .eq('id', user!.id)
    .single()

  if (!profile || (profile.role !== 'super_admin' && profile.role !== 'chapter_head')) redirect('/unauthorized')

  // Chapter admins only see their own chapter; super admins see active chapters
  let areasQuery = supabase
    .from('areas')
    .select('id, name, chapters(id, name)')
    .order('display_order')
    .order('display_order', { referencedTable: 'chapters' })

  if (profile.role === 'chapter_head' && profile.chapter_id) {
    const { data: own } = await supabase
      .from('chapters')
      .select('id, name, area:areas(id, name)')
      .eq('id', profile.chapter_id)
      .single()
    const rawArea = Array.isArray(own?.area) ? own?.area[0] : own?.area
    const areas = rawArea ? [{ ...(rawArea as { id: string; name: string }), chapters: [{ id: own!.id as string, name: own!.name as string }] }] : []
    const { data: categories } = await supabase.from('categories').select('id, name').order('name')
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Add Member (Offline)</h1>
        <p className="text-brand-silver mb-6">Manually add a member from your chapter who applied offline.</p>
        <AddMemberForm areas={areas} categories={categories ?? []} adminChapterId={profile.chapter_id} isSuperAdmin={profile.role === 'super_admin'} />
      </div>
    )
  }

  const { data: areas } = await areasQuery
  const { data: categories } = await supabase.from('categories').select('id, name').order('name')

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Add Member (Offline)</h1>
      <p className="text-brand-silver mb-6">Manually add a member who applied offline — approved immediately.</p>
      <AddMemberForm areas={areas ?? []} categories={categories ?? []} adminChapterId={null} isSuperAdmin={profile.role === 'super_admin'} />
    </div>
  )
}
