'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'

export function JoinTabs({ member, head }: { member: ReactNode; head: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') === 'head' ? 'head' : 'member'

  const href = (t: string) => (t === 'member' ? pathname : `${pathname}?tab=head`)

  return (
    <div>
      <div className="flex justify-center mb-8 px-1" role="tablist" aria-label="Join options">
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:inline-flex w-full sm:w-auto max-w-full bg-brand-sapphire/80 border border-brand-gold/20 rounded-xl p-1 gap-1">
          <Link
            href={href('member')}
            role="tab"
            aria-selected={tab === 'member'}
            scroll={false}
            className={`px-4 sm:px-6 py-3 rounded-lg text-xs sm:text-sm font-display font-semibold transition-all min-h-[44px] flex items-center justify-center text-center ${
              tab === 'member' ? 'bg-brand-gold text-brand-navy' : 'text-brand-silver hover:text-brand-white'
            }`}
          >
            Become a Member
          </Link>
          <Link
            href={href('head')}
            role="tab"
            aria-selected={tab === 'head'}
            scroll={false}
            className={`px-4 sm:px-6 py-3 rounded-lg text-xs sm:text-sm font-display font-semibold transition-all min-h-[44px] flex items-center justify-center text-center ${
              tab === 'head' ? 'bg-brand-gold text-brand-navy' : 'text-brand-silver hover:text-brand-white'
            }`}
          >
            Start a Chapter
          </Link>
        </div>
      </div>
      {tab === 'member' ? member : head}
    </div>
  )
}
