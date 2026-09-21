import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChapterHeadsManager } from '@/components/admin/ChapterHeadsManager'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Chapter Heads | UCCI Admin' }

interface HeadProfile {
  id: string
  full_name: string
  email: string
  phone: string | null
  business_name: string | null
  brand_tagline: string | null
  bio: string | null
  logo_url: string | null
  business_address: string | null
  chapter_id: string | null
}

interface MemberOption {
  id: string
  full_name: string
  business_name: string | null
  email: string
}

export default async function ChapterHeadsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'super_admin') redirect('/admin')

  const { data: areasRaw } = await supabase
    .from('areas')
    .select(`
      id, name, slug,
      chapters(id, name, slug, is_active)
    `)
    .order('display_order')
    .order('display_order', { referencedTable: 'chapters' })

  const chapterIds = (areasRaw ?? []).flatMap(a =>
    ((a as { chapters?: Array<{ id: string }> }).chapters ?? []).map(ch => ch.id)
  )

  // Current heads (any profile with the role in these chapters)
  const { data: headsRaw } = chapterIds.length
    ? await supabase
        .from('profiles')
        .select('id, full_name, email, phone, business_name, brand_tagline, bio, logo_url, business_address, chapter_id')
        .eq('role', 'chapter_head')
        .in('chapter_id', chapterIds)
    : { data: [] as HeadProfile[] }

  const headsByChapter = new Map<string, HeadProfile>()
  for (const h of (headsRaw ?? []) as HeadProfile[]) {
    if (h.chapter_id) headsByChapter.set(h.chapter_id, h)
  }

  // Eligible: approved members per chapter (promotion source)
  const { data: membersRaw } = chapterIds.length
    ? await supabase
        .from('profiles')
        .select('id, full_name, business_name, email, chapter_id')
        .eq('role', 'member')
        .eq('status', 'approved')
        .in('chapter_id', chapterIds)
        .order('business_name')
    : { data: [] as Array<MemberOption & { chapter_id: string }> }

  const membersByChapter = new Map<string, MemberOption[]>()
  for (const m of (membersRaw ?? []) as Array<MemberOption & { chapter_id: string }>) {
    const list = membersByChapter.get(m.chapter_id) ?? []
    list.push({ id: m.id, full_name: m.full_name, business_name: m.business_name, email: m.email })
    membersByChapter.set(m.chapter_id, list)
  }

  const areas = (areasRaw ?? []).map(a => ({
    id: a.id as string,
    name: a.name as string,
    chapters: ((a as { chapters?: Array<{ id: string; name: string; slug: string; is_active: boolean }> }).chapters ?? []).map(ch => ({ ...ch })),
  }))

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Chapter Heads</h1>
      <p className="text-brand-silver mb-6">
        Promote an approved member of each chapter to head. Click an assigned head to view, edit, or remove.
      </p>
      <ChapterHeadsManager
        areas={areas}
        headsByChapter={Object.fromEntries(headsByChapter)}
        membersByChapter={Object.fromEntries(membersByChapter)}
      />
    </div>
  )
}
