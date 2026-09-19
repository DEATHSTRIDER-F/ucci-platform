'use client'

import Link from 'next/link'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'news', label: 'News' },
  { key: 'event', label: 'Events' },
  { key: 'video', label: 'Videos' },
] as const

export function GalleryAdminFilter({ active }: { active: string }) {
  return (
    <div className="inline-flex bg-brand-sapphire/80 border border-brand-gold/20 rounded-xl p-1 gap-1 mb-6" role="tablist" aria-label="Filter by type">
      {FILTERS.map(f => (
        <Link
          key={f.key}
          href={f.key === 'all' ? '/admin/gallery' : `/admin/gallery?type=${f.key}`}
          role="tab"
          aria-selected={active === f.key}
          scroll={false}
          className={`px-5 py-2 rounded-lg text-sm font-display font-semibold transition-all min-h-[44px] flex items-center ${
            active === f.key ? 'bg-brand-gold text-brand-navy' : 'text-brand-silver hover:text-brand-white'
          }`}
        >
          {f.label}
        </Link>
      ))}
    </div>
  )
}
