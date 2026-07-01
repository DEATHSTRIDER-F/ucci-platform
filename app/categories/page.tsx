import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, Tag } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Categories | UCCI',
  description: 'Browse all professional categories available in UCCI chapters across Pune and PCMC. Find vetted experts by specialty.',
}

export default async function CategoriesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: categories } = await supabase
    .from('categories')
    .select(`
      id, name, slug, is_featured, meta_description,
      members:profiles(count)
    `)
    .order('name')

  // Count approved members per category
  const categoriesWithCounts = await Promise.all(
    (categories ?? []).map(async (cat) => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)
        .eq('status', 'approved')
      return { ...cat, memberCount: count ?? 0 }
    })
  )

  return (
    <div className="min-h-screen bg-brand-navy">
      <div className="page-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="section-title">
            Business <span className="text-gradient-gold">Categories</span>
          </h1>
          <p className="section-subtitle">
            {categoriesWithCounts.length} professional categories across UCCI chapters
          </p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-label="All categories">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categoriesWithCounts.map(cat => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="glass-card p-6 group hover:border-brand-gold/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="w-4 h-4 text-brand-gold/60" />
                    <h2 className="font-display font-semibold text-brand-white group-hover:text-brand-gold transition-colors">
                      {cat.name}
                    </h2>
                    {cat.is_featured && <span className="badge text-xs py-0.5">Featured</span>}
                  </div>
                  {cat.meta_description && (
                    <p className="text-brand-silver text-sm line-clamp-2 mt-1">{cat.meta_description}</p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-brand-gold/40 group-hover:text-brand-gold group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
              <div className="mt-3 text-brand-silver/60 text-xs">
                {cat.memberCount} {cat.memberCount === 1 ? 'member' : 'members'}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
