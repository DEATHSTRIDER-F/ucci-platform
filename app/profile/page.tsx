import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ProfileManager, type ProfileData } from '@/components/profile/ProfileManager'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'My Profile | UCCI', robots: { index: false } }

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      id, email, full_name, role, status, business_name, brand_tagline, bio, phone,
      website_url, linkedin_url, business_address, logo_url, ideal_referral_target, referral_triggers,
      chapter:chapters(id, name, slug, area:areas(id, name, slug)),
      category:categories(id, name, slug)
    `)
    .eq('id', user.id)
    .single()

  if (!profile) notFound()

  const rawChapter = Array.isArray(profile.chapter) ? profile.chapter[0] : profile.chapter
  const rawArea = rawChapter && (Array.isArray((rawChapter as { area?: unknown }).area) ? (rawChapter as { area?: unknown[] }).area![0] : (rawChapter as { area?: unknown }).area)
  const rawCategory = Array.isArray(profile.category) ? profile.category[0] : profile.category

  const data = {
    ...(profile as Record<string, unknown>),
    chapter: rawChapter ? { ...(rawChapter as object), area: rawArea ?? undefined } : null,
    category: rawCategory ?? null,
  } as unknown as ProfileData

  // Head check: does this chapter already have a chapter_head?
  let chapterHasHead = false
  if (data.chapter?.id && data.role === 'member' && data.status === 'approved') {
    const { data: head } = await supabase
      .from('profiles')
      .select('id')
      .eq('chapter_id', data.chapter.id)
      .eq('role', 'chapter_head')
      .limit(1)
      .maybeSingle()
    chapterHasHead = !!head
  }

  // Duplicate guard: already applied and still pending?
  let alreadyApplied = false
  if (data.role === 'member' && data.status === 'approved' && !chapterHasHead) {
    const { data: existing } = await supabase
      .from('chapter_head_applications')
      .select('id')
      .eq('email', data.email.toLowerCase())
      .eq('status', 'pending')
      .limit(1)
      .maybeSingle()
    alreadyApplied = !!existing
  }

  return (
    <div className="min-h-screen bg-brand-navy py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-brand-white">My Profile</h1>
          <p className="text-brand-silver mt-1 text-sm">View and manage your UCCI profile.</p>
        </div>
        <ProfileManager profile={data} chapterHasHead={chapterHasHead} alreadyApplied={alreadyApplied} />
      </div>
    </div>
  )
}
