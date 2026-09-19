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
      <div className="flex justify-center mb-8" role="tablist" aria-label="Join options">
        <div className="inline-flex bg-brand-sapphire/80 border border-brand-gold/20 rounded-xl p-1 gap-1">
          <Link
            href={href('member')}
            role="tab"
            aria-selected={tab === 'member'}
            scroll={false}
            className={`px-6 py-3 rounded-lg text-sm font-display font-semibold transition-all min-h-[44px] flex items-center ${
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
            className={`px-6 py-3 rounded-lg text-sm font-display font-semibold transition-all min-h-[44px] flex items-center ${
              tab === 'head' ? 'bg-brand-gold text-brand-navy' : 'text-brand-silver hover:text-brand-white'
            }`}
          >
            Become a Chapter Head
          </Link>
        </div>
      </div>
      {tab === 'member' ? member : head}
    </div>
  )
}
