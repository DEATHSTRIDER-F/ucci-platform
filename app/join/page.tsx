import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingForm } from '@/components/forms/OnboardingForm'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Globe, Linkedin, Phone, MapPin, Building2, Tag, Users, User } from 'lucide-react'
import type { Profile } from '@/lib/types/database'

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
      .select(`
        *,
        chapter:chapters(id, name, slug, area:areas(id, name, slug)),
        category:categories(id, name, slug)
      `)
      .eq('id', user.id)
      .single()

    if (profile?.status === 'approved') {
      const rawChapter = Array.isArray(profile.chapter) ? profile.chapter[0] : profile.chapter
      const rawCategory = Array.isArray(profile.category) ? profile.category[0] : profile.category
      const rawArea = rawChapter && (Array.isArray((rawChapter as any).area) ? (rawChapter as any).area![0] : (rawChapter as any).area)

      type ChapterShape = { id: string; name: string; slug: string; area?: { id: string; name: string; slug: string } }
      type CategoryShape = { id: string; name: string; slug: string }

      const chapter = rawChapter ? { ...rawChapter, area: rawArea ?? undefined } as ChapterShape : undefined
      const category = rawCategory as CategoryShape | undefined

      const p = {
        ...(profile as unknown as Profile),
        chapter,
        category,
      } as Profile & { chapter?: ChapterShape; category?: CategoryShape }

      return (
        <div className="min-h-screen bg-brand-navy py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold text-brand-white">Already a member</h1>
              <p className="text-brand-silver mt-2">Here are your business details.</p>
            </div>
            
            {/* Main Profile */}
            <article itemScope itemType="https://schema.org/ProfessionalService">
              {/* Profile Header */}
              <div className="glass-card p-8 mb-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Logo */}
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-brand-gold/40 flex-shrink-0">
                    {p.logo_url ? (
                      <Image
                        src={p.logo_url}
                        alt={`${p.business_name ?? p.full_name} logo`}
                        fill
                        className="object-cover"
                        priority
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-gold/20 flex items-center justify-center">
                        <User className="w-10 h-10 text-brand-gold" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-white" itemProp="name">
                      {p.business_name ?? p.full_name}
                    </h1>
                    {p.brand_tagline && (
                      <p className="text-brand-champagne text-lg mt-1 italic" itemProp="description">
                        {p.brand_tagline}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {p.category && (
                        <Link href={`/categories/${p.category.slug}`} className="badge flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {p.category.name}
                        </Link>
                      )}
                      {p.chapter && (
                        <Link
                          href={`/chapters/${p.chapter.area?.slug}-${p.chapter.slug}`}
                          className="badge flex items-center gap-1"
                        >
                          <Users className="w-3 h-3" /> UCCI {p.chapter.name} — {p.chapter.area?.name}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* About / Bio */}
              {p.bio && (
                <section className="glass-card p-8 mb-6" aria-labelledby="about-heading">
                  <h2 id="about-heading" className="font-display text-xl font-bold text-brand-gold mb-4">About</h2>
                  <p className="text-brand-silver leading-relaxed" itemProp="description">{p.bio}</p>
                </section>
              )}

              {/* Contact Details */}
              <section className="glass-card p-8 mb-6" aria-labelledby="contact-heading">
                <h2 id="contact-heading" className="font-display text-xl font-bold text-brand-gold mb-4">Contact & Location</h2>
                <div className="space-y-3">
                  {p.phone && (
                    <a href={`tel:${p.phone}`} className="flex items-center gap-3 text-brand-silver hover:text-brand-gold transition-colors group">
                      <Phone className="w-5 h-5 text-brand-gold/60 group-hover:text-brand-gold" />
                      <span itemProp="telephone">{p.phone}</span>
                    </a>
                  )}
                  {p.website_url && (
                    <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-brand-silver hover:text-brand-gold transition-colors group">
                      <Globe className="w-5 h-5 text-brand-gold/60 group-hover:text-brand-gold" />
                      <span itemProp="url" className="truncate">{p.website_url}</span>
                    </a>
                  )}
                  {p.linkedin_url && (
                    <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-brand-silver hover:text-brand-gold transition-colors group">
                      <Linkedin className="w-5 h-5 text-brand-gold/60 group-hover:text-brand-gold" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                  {p.business_address && (
                    <div className="flex items-start gap-3 text-brand-silver">
                      <MapPin className="w-5 h-5 text-brand-gold/60 mt-0.5 flex-shrink-0" />
                      <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                        <span itemProp="streetAddress">{p.business_address}</span>
                      </span>
                    </div>
                  )}
                  {p.chapter && (
                    <div className="flex items-center gap-3 text-brand-silver">
                      <Building2 className="w-5 h-5 text-brand-gold/60" />
                      <span>UCCI {p.chapter.name} Chapter, {p.chapter.area?.name}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Networking Profile */}
              {(p.ideal_referral_target || p.referral_triggers) && (
                <section className="glass-card p-8" aria-labelledby="networking-heading">
                  <h2 id="networking-heading" className="font-display text-xl font-bold text-brand-gold mb-4">Networking Profile</h2>
                  <div className="space-y-4">
                    {p.ideal_referral_target && (
                      <div>
                        <h3 className="text-brand-champagne font-semibold text-sm uppercase tracking-wide mb-2">Ideal Referral Target</h3>
                        <p className="text-brand-silver">{p.ideal_referral_target}</p>
                      </div>
                    )}
                    {p.referral_triggers && (
                      <div>
                        <h3 className="text-brand-champagne font-semibold text-sm uppercase tracking-wide mb-2">Referral Triggers</h3>
                        <p className="text-brand-silver">{p.referral_triggers}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </article>
          </div>
        </div>
      )
    }
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
  } else {
    redirect('/signup?redirectTo=/join')
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
