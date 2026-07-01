import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { buildMemberMetadata } from '@/lib/seo/metadata'
import { buildMemberSchema, JsonLd } from '@/lib/seo/structured-data'
import Image from 'next/image'
import Link from 'next/link'
import { Globe, Linkedin, Phone, MapPin, Building2, Tag, Users, User } from 'lucide-react'
import { LeadInquiryForm } from '@/components/forms/LeadInquiryForm'
import type { Profile } from '@/lib/types/database'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('profiles')
    .select('*, chapter:chapters(name, slug, area:areas(name, slug)), category:categories(name, slug)')
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (!data) return { title: 'Member Not Found' }

  // Normalize Supabase join results (may be arrays)
  const chapter = Array.isArray(data.chapter) ? data.chapter[0] : data.chapter
  const category = Array.isArray(data.category) ? data.category[0] : data.category
  const profileForMeta: Profile = {
    ...(data as unknown as Profile),
    chapter: chapter ? { ...(chapter as object), area: Array.isArray((chapter as { area?: unknown }).area) ? (chapter as { area?: unknown[] }).area![0] : (chapter as { area?: unknown }).area } as Profile['chapter'] : undefined,
    category: category as Profile['category'],
  }
  return buildMemberMetadata(profileForMeta)
}

export default async function MemberProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      chapter:chapters(id, name, slug, area:areas(id, name, slug)),
      category:categories(id, name, slug)
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (!profile) notFound()

  // Normalize Supabase join results (may come back as arrays due to query builder typing)
  const rawChapter = Array.isArray(profile.chapter) ? profile.chapter[0] : profile.chapter
  const rawCategory = Array.isArray(profile.category) ? profile.category[0] : profile.category
  const rawArea = rawChapter && (Array.isArray((rawChapter as { area?: unknown }).area) ? (rawChapter as { area?: unknown[] }).area![0] : (rawChapter as { area?: unknown }).area)

  type ChapterShape = { id: string; name: string; slug: string; area?: { id: string; name: string; slug: string } }
  type CategoryShape = { id: string; name: string; slug: string }

  const chapter = rawChapter ? { ...rawChapter, area: rawArea ?? undefined } as ChapterShape : undefined
  const category = rawCategory as CategoryShape | undefined

  // Cast profile to Profile first then overlay our normalized joins
  const p = {
    ...(profile as unknown as Profile),
    chapter,
    category,
  } as Profile & { chapter?: ChapterShape; category?: CategoryShape }

  return (
    <>
      <JsonLd data={buildMemberSchema(p)} />

      <div className="min-h-screen bg-brand-navy">
        {/* Breadcrumb */}
        <div className="bg-brand-sapphire border-b border-brand-gold/20 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="text-sm text-brand-silver/60">
              <Link href="/" className="hover:text-brand-gold transition-colors">Home</Link>
              <span className="mx-2">/</span>
              {p.category && (
                <>
                  <Link href={`/categories/${p.category.slug}`} className="hover:text-brand-gold transition-colors">
                    {p.category.name}
                  </Link>
                  <span className="mx-2">/</span>
                </>
              )}
              <span className="text-brand-silver">{p.business_name ?? p.full_name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Profile */}
            <article className="lg:col-span-2" itemScope itemType="https://schema.org/ProfessionalService">

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
                <h2 id="contact-heading" className="font-display text-xl font-bold text-brand-gold mb-4">Location</h2>
                <div className="space-y-3">
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

            {/* Sidebar — Lead Inquiry Form */}
            <aside>
              <div className="sticky top-24">
                <div className="glass-card p-6">
                  <h2 className="font-display text-xl font-bold text-brand-white mb-2">
                    Send a Lead Inquiry
                  </h2>
                  <p className="text-brand-silver text-sm mb-6">
                    Interested in connecting with {p.business_name ?? p.full_name}? Send your request below.
                  </p>
                  <LeadInquiryForm
                    targetMemberId={p.id}
                    targetName={p.business_name ?? p.full_name}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
