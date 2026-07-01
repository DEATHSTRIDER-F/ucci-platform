import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { buildChapterMetadata } from '@/lib/seo/metadata'
import Link from 'next/link'
import Image from 'next/image'
import { User, ArrowLeft, Tag } from 'lucide-react'
import type { Chapter, Area } from '@/lib/types/database'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  // slug format: {areaSlug}-{chapterSlug}
  const parts = slug.split('-')
  const areaSlug = parts[0]
  const chapterSlug = parts.slice(1).join('-')

  const { data } = await supabase
    .from('chapters')
    .select('*, area:areas(*)')
    .eq('slug', chapterSlug)
    .eq('areas.slug', areaSlug)
    .single()

  if (!data) return { title: 'Chapter Not Found' }

  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('chapter_id', data.id)
    .eq('status', 'approved')

  const rawArea = Array.isArray(data.area) ? data.area[0] : data.area
  return buildChapterMetadata({ ...(data as unknown as Chapter), area: rawArea as Area }, count ?? 0)
}

export default async function ChapterPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const parts = slug.split('-')
  const areaSlug = parts[0]
  const chapterSlug = parts.slice(1).join('-')

  // Find chapter by slug and area slug
  const { data: areas } = await supabase
    .from('areas')
    .select('id, name, slug')
    .eq('slug', areaSlug)
    .single()

  if (!areas) notFound()

  const { data: chapter } = await supabase
    .from('chapters')
    .select('*')
    .eq('slug', chapterSlug)
    .eq('area_id', areas.id)
    .single()

  if (!chapter) notFound()

  // Fetch approved members in this chapter
  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, business_name, logo_url, brand_tagline, category:categories(name, slug)')
    .eq('chapter_id', chapter.id)
    .eq('status', 'approved')
    .order('business_name')

  return (
    <div className="min-h-screen bg-brand-navy">
      {/* Page Hero */}
      <div className="page-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-silver hover:text-brand-gold transition-colors mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="section-title">
            UCCI <span className="text-gradient-gold">{chapter.name}</span> Chapter
          </h1>
          <p className="section-subtitle">{areas.name} Region · {members?.length ?? 0} Verified Members</p>
        </div>
      </div>

      {/* Members Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-label="Chapter members">
        {!members || members.length === 0 ? (
          <div className="text-center py-20">
            <User className="w-16 h-16 text-brand-silver/20 mx-auto mb-4" />
            <h2 className="text-brand-silver text-xl font-display">No members yet in this chapter</h2>
            <p className="text-brand-silver/60 mt-2">Be the first to join!</p>
            <Link href="/join" className="btn-primary mt-6 inline-flex">Apply Now</Link>
          </div>
        ) : (
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
        )}
      </section>
    </div>
  )
}
