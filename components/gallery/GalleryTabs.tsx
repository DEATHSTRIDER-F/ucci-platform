'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Newspaper, CalendarDays, PlayCircle } from 'lucide-react'

const TABS = [
  { key: 'news', label: 'News', icon: Newspaper },
  { key: 'events', label: 'Events', icon: CalendarDays },
  { key: 'videos', label: 'Videos', icon: PlayCircle },
] as const

import { parseGalleryTab, type GalleryTab } from '@/lib/utils/galleryTab'

export function GalleryTabs({ counts }: { counts: Record<GalleryTab, number> }) {
  const searchParams = useSearchParams()
  const active = parseGalleryTab(searchParams.get('tab'))

  const href = (t: GalleryTab) => (t === 'news' ? '/gallery' : `/gallery?tab=${t}`)

  return (
    <div className="flex justify-center mb-8 px-1" role="tablist" aria-label="Gallery sections">
      <div className="grid grid-cols-3 w-full sm:w-auto sm:inline-flex max-w-full bg-brand-sapphire/80 border border-brand-gold/20 rounded-xl p-1 gap-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            href={href(key)}
            role="tab"
            aria-selected={active === key}
            scroll={false}
            className={`px-2 min-[420px]:px-4 sm:px-8 py-3 rounded-lg text-xs sm:text-sm font-display font-semibold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
              active === key ? 'bg-brand-gold text-brand-navy' : 'text-brand-silver hover:text-brand-white'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{label}</span>
            <span className={`text-[11px] sm:text-xs flex-shrink-0 ${active === key ? 'text-brand-navy/70' : 'text-brand-silver/50'}`}>({counts[key]})</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
