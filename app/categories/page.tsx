import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CategoryIcon } from '@/components/category-icon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Categories | UCCI',
  description: 'Browse all professional categories available in UCCI chapters across Pune and PCMC. Find vetted experts by specialty.',
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'default-no-store'

export default async function CategoriesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, is_featured, meta_description, icon_name, icon_color')
    .order('name')

  // Single aggregated count query — eliminates N+1 (was 20 extra round-trips)
  const { data: countRows } = await supabase
    .from('profiles')
    .select('category_id')
    .eq('status', 'approved')
    .not('category_id', 'is', null)

  const countMap = new Map<string, number>()
  for (const row of countRows ?? []) {
    if (row.category_id) countMap.set(row.category_id, (countMap.get(row.category_id) ?? 0) + 1)
  }

  const categoriesWithCounts = (categories ?? []).map(cat => ({
    ...cat,
    memberCount: countMap.get(cat.id) ?? 0,
  }))

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
          {categoriesWithCounts.map(cat => {
            const iconName = (cat as unknown as { icon_name?: string | null }).icon_name
            const iconColor = (cat as unknown as { icon_color?: string | null }).icon_color
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="glass-card p-6 group hover:border-brand-gold/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <CategoryIcon name={iconName} color={iconColor} size={18} />
                      <h2 className="font-display font-semibold text-brand-white group-hover:text-brand-gold transition-colors truncate">
                        {cat.name}
                      </h2>
                      {cat.is_featured && <span className="badge text-xs py-0.5 shrink-0">Featured</span>}
                    </div>
                    {cat.meta_description && (
                      <p className="text-brand-silver text-sm line-clamp-2 mt-1">{cat.meta_description}</p>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-brand-gold/40 group-hover:text-brand-gold group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
                </div>
                <div className="mt-3 text-brand-silver/60 text-xs">
                  {cat.memberCount} {cat.memberCount === 1 ? 'member' : 'members'}
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
