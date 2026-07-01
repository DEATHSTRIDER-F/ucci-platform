import { createServerSupabaseClient } from '@/lib/supabase/server'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { JsonLd, buildOrganizationSchema, buildWebSiteSchema } from '@/lib/seo/structured-data'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Users, MapPin, Star, TrendingUp } from 'lucide-react'
import type { HeroSlide } from '@/lib/types/database'
import { buildSiteMetadata } from '@/lib/seo/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = buildSiteMetadata()

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  // Fetch hero slides (active only for public)
  const { data: heroSlides } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  // Fetch featured categories
  const { data: featuredCategories } = await supabase
    .from('categories')
    .select('id, name, slug, meta_description')
    .eq('is_featured', true)
    .order('name')
    .limit(5)

  // Fetch areas with chapter counts
  const { data: areas } = await supabase
    .from('areas')
    .select('id, name, slug, chapters(id, name, slug)')
    .order('name')

  // Fetch recent approved members (showcase)
  const { data: showcaseMembers } = await supabase
    .from('profiles')
    .select(`
      id, full_name, business_name, logo_url, brand_tagline,
      category:categories(name, slug),
      chapter:chapters(name, area:areas(name))
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(6)

  // Stats
  const { count: memberCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  return (
    <>
      <JsonLd data={[buildOrganizationSchema(), buildWebSiteSchema()]} />

      {/* Hero + Search */}
      <section aria-label="Hero section" className="relative">
        <HeroCarousel slides={(heroSlides as HeroSlide[]) ?? []} />
        {/* Search bar anchored at bottom of hero, extending slightly below */}
        <div className="absolute top-0 left-0 right-0 z-20">
          {/* Gradient fade from transparent to brand-navy */}
          {/* <div className="h-24 bg-gradient-to-b from-transparent to-brand-navy" /> */}
          <div className="pt-10">
            <div className="max-w-3xl mx-auto px-4">
              <GlobalSearch />
            </div>
          </div>
        </div>
      </section>
      {/* Spacer — accounts for the search bar area that sits below hero */}
      <div className="h-0" />

      {/* Stats Bar */}
      <section className="py-10 bg-brand-sapphire border-y border-brand-gold/20" aria-label="Platform statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Users, value: `${memberCount ?? 0}+`, label: 'Verified Members' },
              { icon: MapPin, value: '7', label: 'Active Chapters' },
              { icon: Star, value: '20+', label: 'Business Categories' },
              { icon: TrendingUp, value: '2', label: 'Geographic Areas' },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <stat.icon className="w-6 h-6 text-brand-gold" />
                <div className="text-2xl md:text-3xl font-display font-bold text-gradient-gold">{stat.value}</div>
                <div className="text-brand-silver text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-brand-navy" aria-labelledby="categories-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="categories-heading" className="section-title">
              Featured <span className="text-gradient-gold">Categories</span>
            </h2>
            <p className="section-subtitle">Find professionals by business category</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(featuredCategories ?? []).map(cat => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="glass-card p-5 hover:border-brand-gold/60 hover:-translate-y-1 transition-all duration-300 group"
              >
                <h3 className="font-display font-semibold text-brand-white group-hover:text-brand-gold transition-colors">
                  {cat.name}
                </h3>
                {cat.meta_description && (
                  <p className="text-brand-silver text-sm mt-1 line-clamp-2">{cat.meta_description}</p>
                )}
                <div className="mt-3 text-brand-gold text-sm flex items-center gap-1 font-medium">
                  View members <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
            {/* View All */}
            <Link
              href="/categories"
              className="glass-card p-5 border-dashed border-brand-gold/30 hover:border-brand-gold/60 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center gap-2 group"
            >
              <div className="text-brand-gold font-display font-semibold group-hover:text-brand-champagne">
                View All Categories
              </div>
              <ArrowRight className="w-5 h-5 text-brand-gold group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Chapters Map Section */}
      <section className="py-16 bg-brand-sapphire" aria-labelledby="chapters-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="chapters-heading" className="section-title">
              Our <span className="text-gradient-gold">Chapters</span>
            </h2>
            <p className="section-subtitle">Connecting professionals across Pune and PCMC</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(areas ?? []).map(area => {
              const chapters = Array.isArray((area as { chapters?: unknown }).chapters) ? (area as { chapters?: Array<{ id: string; name: string; slug: string }> }).chapters! : []
              return (
                <div key={area.id} className="glass-card p-6">
                  <h3 className="font-display text-xl font-bold text-brand-gold mb-4">{area.name}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {chapters.map(chapter => (
                      <Link
                        key={chapter.id}
                        href={`/chapters/${area.slug}-${chapter.slug}`}
                        className="bg-brand-navy/50 rounded-lg px-4 py-3 text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy transition-colors text-center border border-brand-sapphire hover:border-brand-gold/40"
                      >
                        {chapter.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Showcase Members */}
      {showcaseMembers && showcaseMembers.length > 0 && (
        <section className="py-16 bg-brand-navy" aria-labelledby="members-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 id="members-heading" className="section-title">
                Meet Our <span className="text-gradient-gold">Members</span>
              </h2>
              <p className="section-subtitle">Verified professionals ready to network</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(showcaseMembers ?? []).map(member => {
                const category = Array.isArray(member.category) ? member.category[0] : member.category
                const chapter = Array.isArray(member.chapter) ? member.chapter[0] : member.chapter
                const area = chapter && (Array.isArray((chapter as { area?: unknown }).area) ? (chapter as { area?: unknown[] }).area![0] : (chapter as { area?: unknown }).area)
                return (
                  <Link key={member.id} href={`/members/${member.id}`} className="member-card group">
                    <div className="flex items-start gap-4">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-brand-gold/30 flex-shrink-0">
                        {member.logo_url ? (
                          <Image src={member.logo_url} alt={member.business_name ?? member.full_name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-brand-gold/20 flex items-center justify-center">
                            <span className="text-brand-gold font-bold text-lg">
                              {(member.business_name ?? member.full_name).charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-brand-white group-hover:text-brand-gold transition-colors truncate">
                          {member.business_name ?? member.full_name}
                        </h3>
                        {member.brand_tagline && (
                          <p className="text-brand-silver text-sm truncate mt-0.5">{member.brand_tagline}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {category && (
                            <span className="badge text-xs">{(category as { name: string }).name}</span>
                          )}
                          {chapter && (
                            <span className="text-brand-silver/60 text-xs">
                              {(chapter as { name: string }).name} • {area ? (area as { name: string }).name : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            <div className="text-center mt-8">
              <Link href="/categories" className="btn-outline">
                Browse All Members
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Preview */}
      <section className="py-16 bg-brand-sapphire" aria-labelledby="how-it-works-preview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="how-it-works-preview" className="section-title mb-4">
            How <span className="text-gradient-gold">UCCI</span> Works
          </h2>
          <p className="section-subtitle mb-12 max-w-2xl mx-auto">
            Join an exclusive network of verified professionals in your industry
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Apply & Schedule', desc: 'Complete your profile and book a vetting interview with your chapter admin.' },
              { step: '02', title: 'Get Vetted', desc: 'Meet with the chapter admin, pay the membership fee, and get approved.' },
              { step: '03', title: 'Network & Grow', desc: 'Appear in the directory, receive referrals, and grow your business through UCCI.' },
            ].map(item => (
              <div key={item.step} className="glass-card p-8 text-center relative overflow-hidden">
                <div className="text-6xl font-display font-bold text-brand-gold/10 absolute top-4 right-4">{item.step}</div>
                <div className="relative">
                  <div className="text-brand-gold font-display font-bold text-lg mb-2">{item.step}</div>
                  <h3 className="font-display text-xl font-bold text-brand-white mb-3">{item.title}</h3>
                  <p className="text-brand-silver">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/join" className="btn-primary text-base">
              Join UCCI Today <ArrowRight className="w-5 h-5 inline ml-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
