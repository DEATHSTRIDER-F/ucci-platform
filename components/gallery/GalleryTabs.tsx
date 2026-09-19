'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Newspaper, CalendarDays, PlayCircle } from 'lucide-react'

const TABS = [
  { key: 'news', label: 'News', icon: Newspaper },
  { key: 'events', label: 'Events', icon: CalendarDays },
  { key: 'videos', label: 'Videos', icon: PlayCircle },
] as const

export type GalleryTab = (typeof TABS)[number]['key']

export function parseGalleryTab(value: string | null): GalleryTab {
  if (value === 'events' || value === 'videos') return value
  return 'news'
}

export function GalleryTabs({ counts }: { counts: Record<GalleryTab, number> }) {
  const searchParams = useSearchParams()
  const active = parseGalleryTab(searchParams.get('tab'))

  const href = (t: GalleryTab) => (t === 'news' ? '/gallery' : `/gallery?tab=${t}`)

  return (
    <div className="flex justify-center mb-10" role="tablist" aria-label="Gallery sections">
      <div className="inline-flex bg-brand-sapphire/80 border border-brand-gold/20 rounded-xl p-1 gap-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            href={href(key)}
            role="tab"
            aria-selected={active === key}
            scroll={false}
            className={`px-5 sm:px-8 py-3 rounded-lg text-sm font-display font-semibold transition-all min-h-[44px] flex items-center gap-2 ${
              active === key ? 'bg-brand-gold text-brand-navy' : 'text-brand-silver hover:text-brand-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-xs ${active === key ? 'text-brand-navy/70' : 'text-brand-silver/50'}`}>({counts[key]})</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
