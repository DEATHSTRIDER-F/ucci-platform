'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Building2, Tag, ChevronRight, Search, Crown } from 'lucide-react'

export interface MemberRow {
  id: string
  full_name: string
  business_name: string | null
  email: string
  role: string
  created_at: string
  chapterName: string | null
  areaName: string | null
  categoryName: string | null
}

export function MembersTable({ members, total, pageSize }: { members: MemberRow[]; total: number; pageSize: number }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return members
    return members.filter(m =>
      m.full_name.toLowerCase().includes(q) ||
      (m.business_name ?? '').toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.chapterName ?? '').toLowerCase().includes(q) ||
      (m.categoryName ?? '').toLowerCase().includes(q)
    )
  }, [members, query])

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver/50" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search name, business, email, chapter, category..."
          aria-label="Search members"
          className="input-field pl-10 text-sm"
        />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-navy/50 border-b border-brand-gold/20">
              <tr>
                <th className="px-6 py-4 font-medium text-brand-silver">Member / Business</th>
                <th className="px-6 py-4 font-medium text-brand-silver">Contact</th>
                <th className="px-6 py-4 font-medium text-brand-silver">Chapter & Category</th>
                <th className="px-6 py-4 font-medium text-brand-silver">Joined</th>
                <th className="px-6 py-4 font-medium text-brand-silver text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-brand-silver/60">
                    {query ? 'No members match your search.' : 'No approved members found.'}
                  </td>
                </tr>
              ) : (
                filtered.map(member => (
                  <tr key={member.id} className="hover:bg-brand-navy/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-brand-white">{member.business_name || member.full_name}</span>
                        {member.role === 'chapter_head' && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-champagne border border-brand-gold/40 font-medium">
                            <Crown className="w-3 h-3" /> Chapter Head
                          </span>
                        )}
                      </div>
                      {member.business_name && <div className="text-brand-silver/60 text-xs mt-0.5">{member.full_name}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-brand-silver">{member.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-brand-champagne mb-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{member.chapterName} ({member.areaName})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-brand-silver/60 text-xs">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{member.categoryName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-brand-silver">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/members/${member.id}`}
                        className="inline-flex items-center gap-1 text-brand-gold hover:text-brand-champagne transition-colors text-sm font-medium"
                      >
                        View Profile <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-brand-silver/50 text-xs">
        Showing {filtered.length} of {members.length} loaded{total > pageSize ? ` (${total} total)` : ''}.
      </p>
    </div>
  )
}
