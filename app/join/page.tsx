import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { OnboardingForm } from '@/components/forms/OnboardingForm'
import { StartChapterApply, type HeadApplyState } from '@/components/forms/StartChapterApply'
import { JoinTabs } from '@/components/forms/JoinTabs'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, Crown } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Join UCCI | Become a Member or Chapter Head',
  description: 'Join UCCI: become a member with curated onboarding or apply to lead a chapter. Rs. 6k + 6k venue offline. Office 202 HM Royal, Kondhwa Pune.',
}

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string }>
}) {
  const { chapter: chapterParam } = await searchParams
  const supabase = await createServerSupabaseClient()

  // If already authenticated, check status
  const { data: { user } } = await supabase.auth.getUser()
  type MeProfile = {
    id: string; status: string | null; role: string; full_name: string; email: string; phone: string | null
    chapter_id: string | null
    chapter?: { id: string; name: string; slug: string; area?: { id: string; name: string; slug: string } } | null
  }
  let me: MeProfile | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        id, status, role, full_name, email, phone, chapter_id,
        chapter:chapters(id, name, slug, area:areas(id, name, slug))
      `)
      .eq('id', user.id)
      .single()
    if (profile) {
      const rawChapter = Array.isArray(profile.chapter) ? profile.chapter[0] : profile.chapter
      const rawArea = rawChapter && (Array.isArray((rawChapter as { area?: unknown }).area) ? (rawChapter as { area?: unknown[] }).area![0] : (rawChapter as { area?: unknown }).area)
      me = {
        id: profile.id as string,
        status: profile.status as string | null,
        role: profile.role as string,
        full_name: profile.full_name as string,
        email: profile.email as string,
        phone: profile.phone as string | null,
        chapter_id: profile.chapter_id as string | null,
        chapter: rawChapter ? { ...(rawChapter as { id: string; name: string; slug: string }), area: (rawArea ?? undefined) as { id: string; name: string; slug: string } | undefined } : null,
      }
    }

    if (me?.status === 'approved') {
      return (
        <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
          <div className="glass-card p-10 max-w-lg w-full text-center">
            <h1 className="font-display text-2xl font-bold text-brand-white mb-3">You are already a part of our family</h1>
            <p className="text-brand-silver mb-6">
              Your membership is active. Manage your details from your profile page.
            </p>
            <a href="/profile" className="btn-primary text-sm">Go to My Profile</a>
          </div>
        </div>
      )
    }
    if (me?.status === 'pending') {
      return (
        <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
          <div className="glass-card p-10 max-w-lg w-full text-center">
            <div className="text-5xl mb-4">⏳</div>
            <h1 className="font-display text-2xl font-bold text-brand-white mb-3">Application Under Review</h1>
            <p className="text-brand-silver">
              Your application is currently being reviewed by your chapter admin. You will be notified once a decision is made.
            </p>
          </div>
        </div>
      )
    }
  }

  // Fetch chapters and categories for the form (active chapters only)
  const { data: areasRaw } = await supabase
    .from('areas')
    .select('id, name, slug, chapters(id, name, slug, is_active, profiles(id))')
    .order('display_order')
    .order('display_order', { referencedTable: 'chapters' })

  const areas = (areasRaw ?? []).map(a => ({
    ...a,
    chapters: ((a as { chapters?: Array<{ id: string; name: string; slug: string; is_active: boolean }> }).chapters ?? []).filter(ch => ch.is_active !== false),
  }))

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('display_order')

  // Prefilled chapter from chapter page CTA (?chapter=<id>) — validated active
  let prefilledChapterId: string | null = null
  let prefilledChapterName: string | null = null
  if (chapterParam) {
    const { data: pre } = await supabase
      .from('chapters')
      .select('id, name, is_active, area:areas(name)')
      .eq('id', chapterParam)
      .maybeSingle()
    if (pre && (pre as { is_active?: boolean }).is_active !== false) {
      prefilledChapterId = pre.id as string
      const rawArea = Array.isArray(pre.area) ? pre.area[0] : pre.area
      prefilledChapterName = `${(rawArea as { name: string } | null)?.name ?? ''} ${pre.name as string}`.trim()
    }
  }

  // Start-a-Chapter eligibility (checked before the form is ever shown):
  // same chapter only, active (approved) members, vacant head seat.
  let headState: HeadApplyState = { kind: 'login' }
  let headApplicant: { name: string; email: string; phone: string; chapterId: string; chapterLabel: string } | undefined
  if (me) {
    if (me.role === 'chapter_head') {
      headState = { kind: 'already-head' }
    } else if (me.role === 'super_admin') {
      headState = { kind: 'admin' }
    } else if (me.role !== 'member' || me.status !== 'approved' || !me.chapter_id) {
      headState = { kind: 'not-member', status: me.status }
    } else {
      const chapterLabel = `${me.chapter?.area?.name ?? ''} ${me.chapter?.name ?? ''}`.trim()
      const { data: existingHead } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('chapter_id', me.chapter_id)
        .eq('role', 'chapter_head')
        .limit(1)
        .maybeSingle()
      if (existingHead) {
        headState = { kind: 'occupied', headName: (existingHead.full_name as string) ?? 'another member' }
      } else {
        const { data: pendingApp } = await supabase
          .from('chapter_head_applications')
          .select('id, status')
          .eq('email', me.email.toLowerCase())
          .eq('status', 'pending')
          .limit(1)
          .maybeSingle()
        if (pendingApp) {
          headState = { kind: 'pending' }
        } else {
          const { data: rejectedApp } = await supabase
            .from('chapter_head_applications')
            .select('id')
            .eq('email', me.email.toLowerCase())
            .eq('status', 'rejected')
            .limit(1)
            .maybeSingle()
          headState = rejectedApp ? { kind: 'rejected' } : { kind: 'eligible' }
          headApplicant = { name: me.full_name, email: me.email, phone: me.phone ?? '', chapterId: me.chapter_id, chapterLabel }
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-brand-navy">
      <div className="page-hero py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="section-title">
            Join <span className="text-gradient-gold">UCCI</span>
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Suspense fallback={<div className="text-center text-brand-silver py-10">Loading...</div>}>
        <JoinTabs
          member={
            <div className="space-y-8">
              <div className="glass-card p-6">
                <h2 className="font-display font-bold text-brand-gold mb-3 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5" /> Become a Member
                </h2>
                <p className="text-brand-silver text-sm leading-relaxed">
                  Join your local chapter, get listed in our exclusive business directory (one member per category
                  per chapter), receive vetted referrals, and attend chapter meets. Fill the inquiry below, pick an
                  interview date, and our admin team will review your application.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card p-6">
                  <h3 className="font-display font-bold text-brand-white mb-2">Why join a chapter?</h3>
                  <ul className="space-y-2 text-brand-silver text-sm list-disc pl-5">
                    <li>Exclusive category ownership in your chapter — zero direct competition.</li>
                    <li>Warm referrals and curated introductions from fellow members.</li>
                    <li>Regular chapter meets, learning sessions, and business showcases.</li>
                    <li>Public directory listing that builds trust with customers.</li>
                  </ul>
                </div>
                <div className="glass-card p-6">
                  <h3 className="font-display font-bold text-brand-white mb-2">Eligibility to join</h3>
                  <ul className="space-y-2 text-brand-silver text-sm list-disc pl-5">
                    <li>Own or represent a genuine business with a verifiable address.</li>
                    <li>Your category must be vacant in your preferred chapter.</li>
                    <li>Commit to attending chapter meets and the membership code of conduct.</li>
                    <li>Membership fee (Rs. 6,000 + Rs. 6,000 venue) payable offline on approval.</li>
                  </ul>
                </div>
              </div>

              <div className="glass-card p-6">
                <h2 className="font-display font-bold text-brand-gold mb-3">How joining works</h2>
                <ul className="space-y-2 text-brand-silver text-sm list-disc pl-5">
                  <li><strong className="text-brand-white">Inquiry to Admin:</strong> Your form is sent to UCCI Admin (info@ucciindia.org), not directly to a member.</li>
                  <li><strong className="text-brand-white">Call with Leadership:</strong> Admin schedules a call to confirm chapter/locality fit across 7 chapters.</li>
                  <li><strong className="text-brand-white">Admin creates profile:</strong> No self-service dashboard yet, curated manual creation.</li>
                  <li><strong className="text-brand-white">Fees offline:</strong> Rs. 6k + Rs. 6k venue, tracked manually. No revenue share.</li>
                </ul>
              </div>

              <OnboardingForm
                areas={(areas as Array<{
                  id: string; name: string; slug: string;
                  chapters: Array<{ id: string; name: string; slug: string }>
                }>) ?? []}
                categories={categories ?? []}
                initialChapterId={prefilledChapterId}
                prefilledChapterName={prefilledChapterName}
                isLoggedIn={!!user}
                initialName={me?.full_name ?? null}
                initialEmail={me?.email ?? null}
              />
            </div>
          }
          head={
            <div className="space-y-8">
              <div className="glass-card p-6">
                <h2 className="font-display font-bold text-brand-gold mb-3 flex items-center gap-2">
                  <Crown className="w-5 h-5" /> Start a Chapter
                </h2>
                <p className="text-brand-silver text-sm leading-relaxed">
                  Chapter Heads lead a local UCCI chapter — onboarding members, hosting meets, and driving referrals.
                  Tell us who you are and which chapter you&apos;d like to lead; our admin team reviews every application.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card p-6">
                  <h3 className="font-display font-bold text-brand-white mb-2">Why lead a chapter?</h3>
                  <ul className="space-y-2 text-brand-silver text-sm list-disc pl-5">
                    <li>Position yourself as the business leader of your locality.</li>
                    <li>Build the strongest referral network in your area.</li>
                    <li>Shape chapter culture, meets, and growth with UCCI support.</li>
                    <li>First access to cross-chapter and city-level opportunities.</li>
                  </ul>
                </div>
                <div className="glass-card p-6">
                  <h3 className="font-display font-bold text-brand-white mb-2">Eligibility to lead</h3>
                  <ul className="space-y-2 text-brand-silver text-sm list-disc pl-5">
                    <li>You must be an <strong className="text-brand-white">approved (active) member</strong> of the chapter.</li>
                    <li>The <strong className="text-brand-white">head position for your chapter must be vacant</strong> — one head per chapter.</li>
                    <li>You can only lead your own chapter, not another one.</li>
                    <li>Commitment to host regular meets and uphold UCCI values.</li>
                    <li>Final appointment is at the discretion of UCCI admin.</li>
                  </ul>
                </div>
              </div>

              <StartChapterApply state={headState} applicant={headApplicant} />
            </div>
          }
        />
        </Suspense>
      </div>
    </div>
  )
}
