import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ApplicationReviewClient } from '@/components/admin/ApplicationReviewClient'
import type { Profile } from '@/lib/types/database'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Applications | UCCI Admin' }

export default async function ApplicationsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id, role, chapter_id')
    .eq('id', user!.id)
    .single()

  const isSuperAdmin = adminProfile?.role === 'super_admin'

  let query = supabase
    .from('profiles')
    .select(`
      *,
      chapter:chapters(id, name, area:areas(name)),
      category:categories(id, name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Chapter admin: scope to their chapter
  if (!isSuperAdmin && adminProfile?.chapter_id) {
    query = query.eq('chapter_id', adminProfile.chapter_id)
  }

  const { data: raw } = await query

  // Normalize Supabase join arrays to single objects
  const applications = (raw ?? []).map(app => {
    const chapter = Array.isArray(app.chapter) ? app.chapter[0] : app.chapter
    const area = chapter && (Array.isArray((chapter as { area?: unknown }).area) ? (chapter as { area?: unknown[] }).area![0] : (chapter as { area?: unknown }).area)
    const category = Array.isArray(app.category) ? app.category[0] : app.category
    return {
      ...(app as unknown as Profile),
      chapter: chapter ? { ...chapter, area: area ?? undefined } as { id: string; name: string; area?: { name: string } } : undefined,
      category: category as { id: string; name: string } | undefined,
    }
  })

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Pending Applications</h1>
      <p className="text-brand-silver mb-6">Review and approve or reject membership applications.</p>
      <ApplicationReviewClient
        applications={applications}
        adminId={adminProfile?.id ?? ''}
      />
    </div>
  )
}
