import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { buildCategoryMetadata } from '@/lib/seo/metadata'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, User } from 'lucide-react'
import type { Category } from '@/lib/types/database'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) return { title: 'Category Not Found' }

  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', category.id)
    .eq('status', 'approved')

  return buildCategoryMetadata(category as Category, count ?? 0)
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const { data: members } = await supabase
    .from('profiles')
    .select(`
      id, full_name, business_name, logo_url, brand_tagline, phone,
      chapter:chapters(name, slug, area:areas(name, slug))
    `)
    .eq('category_id', category.id)
    .eq('status', 'approved')
    .order('business_name')

  return (
    <div className="min-h-screen bg-brand-navy">
      <div className="page-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/categories" className="inline-flex items-center gap-2 text-brand-silver hover:text-brand-gold transition-colors mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> All Categories
          </Link>
          <h1 className="section-title">
            <span className="text-gradient-gold">{category.name}</span> Professionals
          </h1>
          <p className="section-subtitle">
            {members?.length ?? 0} verified {category.name} expert{(members?.length ?? 0) !== 1 ? 's' : ''} across all UCCI chapters
          </p>
          {category.meta_description && (
            <p className="text-brand-silver/70 mt-2 max-w-2xl">{category.meta_description}</p>
          )}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-label="Category members">
        {!members || members.length === 0 ? (
          <div className="text-center py-20">
            <User className="w-16 h-16 text-brand-silver/20 mx-auto mb-4" />
            <h2 className="text-brand-silver text-xl font-display">No members in this category yet</h2>
            <Link href="/join" className="btn-primary mt-6 inline-flex">Apply as {category.name}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(members ?? []).map(member => {
              const chapter = Array.isArray(member.chapter) ? member.chapter[0] : member.chapter
              const area = chapter && (Array.isArray(chapter.area) ? chapter.area[0] : chapter.area)
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
                    {chapter && (
                      <p className="text-brand-silver/60 text-xs mt-2">
                        {chapter.name} Chapter{area ? ` · ${area.name}` : ''}
                      </p>
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
