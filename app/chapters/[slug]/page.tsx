import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { buildChapterMetadata } from '@/lib/seo/metadata'
import { resolveChapterSlug } from '@/lib/data/chapters'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Tag, CheckCircle } from 'lucide-react'
import type { Chapter, Area } from '@/lib/types/database'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const resolved = await resolveChapterSlug(supabase, slug)

  if (!resolved) return { title: 'Chapter Not Found' }
  if (!resolved.chapter.is_active) {
    return {
      title: `UCCI ${resolved.area.name} ${resolved.chapter.name} — Coming Soon`,
      robots: { index: false, follow: true },
    }
  }

  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('chapter_id', resolved.chapter.id)
    .eq('status', 'approved')

  return buildChapterMetadata(
    {
      ...(resolved.chapter as unknown as Chapter),
      area: resolved.area as Area,
    },
    count ?? 0
  )
}

export default async function ChapterPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const resolved = await resolveChapterSlug(supabase, slug)

  if (!resolved) notFound()

  const { area, chapter } = resolved
  const title = `${area.name} ${chapter.name}`

  // Inactive chapters: no member listing — show Coming Soon instead
  if (!chapter.is_active) {
    return (
      <div className="min-h-screen bg-brand-navy">
        <div className="page-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-brand-silver hover:text-brand-gold transition-colors mb-6 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="section-title">
              UCCI <span className="text-gradient-gold">{title}</span> Chapter
            </h1>
            <p className="section-subtitle">{area.name} Region</p>
            <div className="mt-6">
              <span className="badge text-sm px-4 py-2">Coming Soon</span>
            </div>
            <p className="text-brand-silver/70 mt-4 max-w-xl mx-auto">
              We&apos;re setting up this chapter. Join the waitlist and we&apos;ll notify you when it launches.
            </p>
            <Link href="/join" className="btn-primary mt-6 inline-flex">Notify Me — Join UCCI</Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch approved members in this chapter
  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, business_name, logo_url, brand_tagline, category:categories(name, slug)')
    .eq('chapter_id', chapter.id)
    .eq('status', 'approved')
    .order('business_name')

  const highlightLines = (chapter.highlights ?? '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-brand-navy">
      {/* Page Hero */}
      <div className="page-hero !pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-silver hover:text-brand-gold transition-colors mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="section-title">
            {area.name} <span className="text-gradient-gold">{chapter.name}</span>
          </h1>
          <p className="section-subtitle">UCCI Chapter · {area.name} Region · {members?.length ?? 0} Verified Members</p>
        </div>
      </div>

      {/* Admin-curated content */}
      {(chapter.cover_image_url || chapter.info || highlightLines.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5" aria-label="About this chapter">
          {chapter.cover_image_url && (
            <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-brand-gold/20 mb-6">
              <Image
                src={chapter.cover_image_url}
                alt={`${title} chapter cover`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
          )}
          {(chapter.info || highlightLines.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {chapter.info && (
                <div className="glass-card p-6">
                  <h2 className="font-display text-lg font-bold text-brand-gold mb-3">About {title}</h2>
                  <p className="text-brand-silver leading-relaxed whitespace-pre-line">{chapter.info}</p>
                </div>
              )}
              {highlightLines.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="font-display text-lg font-bold text-brand-gold mb-3">Chapter Highlights</h2>
                  <ul className="space-y-2.5">
                    {highlightLines.map((h, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-brand-silver text-sm">
                        <CheckCircle className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Join CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 text-center" aria-label="Join this chapter">
        <Link href={`/join?chapter=${chapter.id}`} className="btn-primary inline-flex text-base">
          Join {title} Chapter
        </Link>
      </section>

      {/* Members Grid */}
      {(members ?? []).length > 0 && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-label="Chapter members">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(members ?? []).map(member => {
              const category = Array.isArray(member.category) ? member.category[0] : member.category
              return (
              <Link key={member.id} href={`/members/${member.id}`} className="member-card group">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-brand-gold/30 flex-shrink-0">
                    {member.logo_url ? (
                      <Image src={member.logo_url} alt={member.business_name ?? member.full_name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-gold/20 flex items-center justify-center">
                        <span className="text-brand-gold font-bold text-xl">
                          {(member.business_name ?? member.full_name).charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display font-semibold text-brand-white group-hover:text-brand-gold transition-colors truncate">
                      {member.business_name ?? member.full_name}
                    </h2>
                    {member.brand_tagline && (
                      <p className="text-brand-silver text-sm truncate mt-0.5">{member.brand_tagline}</p>
                    )}
                    {category && (
                      <span className="badge mt-2 inline-flex items-center gap-1 text-xs">
                        <Tag className="w-3 h-3" /> {(category as { name: string }).name}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              )
            })}
          </div>
      </section>
      )}
    </div>
  )
}
