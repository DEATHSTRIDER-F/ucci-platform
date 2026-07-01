import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Globe, Linkedin, Phone, MapPin, Building2, Tag, Users, User, ArrowLeft } from 'lucide-react'
import type { Profile } from '@/lib/types/database'

export const metadata = {
  title: 'Member Profile | Admin',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminMemberProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  // Verify auth and get current user profile for scoping
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role, chapter_id')
    .eq('id', user.id)
    .single()

  if (!adminProfile || (adminProfile.role !== 'super_admin' && adminProfile.role !== 'chapter_admin')) {
    redirect('/unauthorized')
  }

  // Fetch the target member's profile
  let query = supabase
    .from('profiles')
    .select(`
      *,
      chapter:chapters(id, name, slug, area:areas(id, name, slug)),
      category:categories(id, name, slug)
    `)
    .eq('id', id)
    .eq('status', 'approved')

  // Apply scope: chapter admins can only view members in their chapter
  if (adminProfile.role === 'chapter_admin' && adminProfile.chapter_id) {
    query = query.eq('chapter_id', adminProfile.chapter_id)
  }

  const { data: profile } = await query.single()

  if (!profile) notFound()

  // Normalize Supabase join results
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Back Navigation */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/members" 
          className="p-2 rounded-full hover:bg-brand-navy/50 text-brand-silver hover:text-brand-gold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-white">Member Profile</h1>
          <p className="text-brand-silver text-sm mt-1">Viewing detailed profile information</p>
        </div>
      </div>

      {/* Main Profile Structure - Reused from /join and /members/[id] layout */}
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
              {p.business_name && (
                <p className="text-brand-silver mt-1">
                  Primary Contact: {p.full_name}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {p.category && (
                  <div className="badge flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {p.category.name}
                  </div>
                )}
                {p.chapter && (
                  <div className="badge flex items-center gap-1">
                    <Users className="w-3 h-3" /> UCCI {p.chapter.name} — {p.chapter.area?.name}
                  </div>
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

        {/* Contact Details (Full info visible to Admins) */}
        <section className="glass-card p-8 mb-6" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="font-display text-xl font-bold text-brand-gold mb-4">Contact & Location</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-brand-silver">
              <User className="w-5 h-5 text-brand-gold/60" />
              <span>{p.email}</span>
            </div>
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
  )
}