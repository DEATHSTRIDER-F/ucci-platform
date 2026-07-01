import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingForm } from '@/components/forms/OnboardingForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join UCCI | Apply for Membership',
  description: 'Apply to join a UCCI chapter. Fill in your business details, select your chapter and category, and schedule a vetting interview.',
}

export default async function JoinPage() {
  const supabase = await createServerSupabaseClient()

  // If already authenticated, check status
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()

    if (profile?.status === 'approved') redirect('/admin')
    if (profile?.status === 'pending') {
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

  // Fetch chapters and categories for the form
  const { data: areas } = await supabase
    .from('areas')
    .select('id, name, slug, chapters(id, name, slug, profiles(id))')
    .order('name')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  return (
    <div className="min-h-screen bg-brand-navy">
      <div className="page-hero py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="section-title">
            Join <span className="text-gradient-gold">UCCI</span>
          </h1>
          <p className="section-subtitle max-w-2xl mx-auto">
            Complete your member profile and schedule your vetting interview to secure your exclusive seat in a UCCI chapter.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <OnboardingForm
          areas={(areas as Array<{
            id: string; name: string; slug: string;
            chapters: Array<{ id: string; name: string; slug: string }>
          }>) ?? []}
          categories={categories ?? []}
        />
      </div>
    </div>
  )
}
