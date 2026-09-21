import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ApplicationReviewClient } from '@/components/admin/ApplicationReviewClient'
import { ChapterHeadReviewClient } from '@/components/admin/ChapterHeadReviewClient'
import { ApplicationsTabs } from '@/components/admin/ApplicationsTabs'
import type { Profile, ChapterHeadApplication } from '@/lib/types/database'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

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

  // Chapter head applications (pending)
  let headQuery = supabase
    .from('chapter_head_applications')
    .select('*, chapter:chapters(id, name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (!isSuperAdmin && adminProfile?.chapter_id) {
    headQuery = headQuery.or(`chapter_id.eq.${adminProfile.chapter_id},chapter_id.is.null`)
  }

  const { data: headRaw } = await headQuery
  const headApplications: ChapterHeadApplication[] = (headRaw ?? []).map((row: Record<string, unknown>) => {
    const chapter = Array.isArray(row.chapter) ? row.chapter[0] : row.chapter
    return { ...(row as unknown as ChapterHeadApplication), chapter: (chapter ?? null) as ChapterHeadApplication['chapter'] }
  })

  // Chapters for the assign-on-approve picker (scoped for chapter admins)
  const { data: areasForPick } = await supabase
    .from('areas')
    .select('id, name, chapters(id, name)')
    .order('display_order')
    .order('display_order', { referencedTable: 'chapters' })

  const pickChapters = (areasForPick ?? []).flatMap(a => {
    if (!isSuperAdmin && adminProfile?.chapter_id) {
      const own = ((a as { chapters?: Array<{ id: string; name: string }> }).chapters ?? []).filter(ch => ch.id === adminProfile.chapter_id)
      if (own.length === 0) return []
      return own.map(ch => ({ id: ch.id, name: ch.name, areaName: a.name as string }))
    }
    return ((a as { chapters?: Array<{ id: string; name: string }> }).chapters ?? []).map(ch => ({ id: ch.id, name: ch.name, areaName: a.name as string }))
  })

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Applications</h1>
      <p className="text-brand-silver mb-6">Review and approve or reject membership and Start a Chapter applications.</p>
      <ApplicationsTabs
        memberCount={applications.length}
        headCount={headApplications.length}
        member={
          <ApplicationReviewClient
            applications={applications}
            adminId={adminProfile?.id ?? ''}
          />
        }
        head={
          <ChapterHeadReviewClient
            applications={headApplications}
            adminId={adminProfile?.id ?? ''}
            chapters={pickChapters}
          />
        }
      />
    </div>
  )
}
