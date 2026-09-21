'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

export function ApplicationsTabs({
  memberCount,
  headCount,
  member,
  head,
}: {
  memberCount: number
  headCount: number
  member: ReactNode
  head: ReactNode
}) {
  const [tab, setTab] = useState<'member' | 'head'>('member')

  const btn = (active: boolean) =>
    `px-5 py-2.5 rounded-lg text-sm font-display font-semibold transition-all min-h-[44px] ${
      active ? 'bg-brand-gold text-brand-navy' : 'text-brand-silver hover:text-brand-white'
    }`

  return (
    <div>
      <div className="inline-flex bg-brand-sapphire/80 border border-brand-gold/20 rounded-xl p-1 gap-1 mb-6" role="tablist" aria-label="Application types">
        <button role="tab" aria-selected={tab === 'member'} onClick={() => setTab('member')} className={btn(tab === 'member')}>
          Member Applications ({memberCount})
        </button>
        <button role="tab" aria-selected={tab === 'head'} onClick={() => setTab('head')} className={btn(tab === 'head')}>
          Start a Chapter Applications ({headCount})
        </button>
      </div>
      {tab === 'member' ? member : head}
    </div>
  )
}
