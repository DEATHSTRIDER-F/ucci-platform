'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { assignChapterHead, demoteChapterHead } from '@/app/actions/admin'
import { SearchableSelect } from '@/components/forms/SearchableSelect'
import { Loader2, User, X, Pencil, UserMinus, Check, Search } from 'lucide-react'

export interface HeadProfile {
  id: string
  full_name: string
  email: string
  phone: string | null
  business_name: string | null
  brand_tagline: string | null
  bio: string | null
  logo_url: string | null
  business_address: string | null
  chapter_id: string | null
}

export interface MemberOption {
  id: string
  full_name: string
  business_name: string | null
  email: string
}

interface Chapter {
  id: string
  name: string
  slug: string
  is_active: boolean
}

interface Area {
  id: string
  name: string
  chapters: Chapter[]
}

interface Props {
  areas: Area[]
  headsByChapter: Record<string, HeadProfile>
  membersByChapter: Record<string, MemberOption[]>
}

export function ChapterHeadsManager({ areas, headsByChapter: initialHeads, membersByChapter }: Props) {
  const [heads, setHeads] = useState(initialHeads)
  const [selected, setSelected] = useState<{ area: Area; chapter: Chapter } | null>(null)
  const [assignId, setAssignId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const visibleAreas = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return areas
    return areas
      .map(area => ({
        ...area,
        chapters: area.chapters.filter(ch => {
          const h = heads[ch.id]
          return (
            area.name.toLowerCase().includes(q) ||
            ch.name.toLowerCase().includes(q) ||
            (h?.full_name ?? '').toLowerCase().includes(q) ||
            (h?.business_name ?? '').toLowerCase().includes(q)
          )
        }),
      }))
      .filter(area => area.chapters.length > 0)
  }, [areas, heads, query])

  const openChapter = (area: Area, chapter: Chapter) => {
    setSelected({ area, chapter })
    setAssignId('')
    setError('')
  }

  const close = () => {
    setSelected(null)
    setAssignId('')
    setError('')
  }

  const handleAssign = async () => {
    if (!selected || !assignId) { setError('Select a member first.'); return }
    setLoading(true)
    setError('')
    const result = await assignChapterHead(selected.chapter.id, assignId)
    if (result.success) {
      // Refresh local state: drop stale head, new head details come from member option
      const member = (membersByChapter[selected.chapter.id] ?? []).find(m => m.id === assignId)
      if (member) {
        setHeads(h => ({
          ...h,
          [selected.chapter.id]: {
            id: member.id,
            full_name: member.full_name,
            email: member.email,
            phone: null,
            business_name: member.business_name,
            brand_tagline: null,
            bio: null,
            logo_url: null,
            business_address: null,
            chapter_id: selected.chapter.id,
          },
        }))
      }
      close()
    } else {
      setError(result.error ?? 'Failed to assign.')
    }
    setLoading(false)
  }

  const handleDemote = async (headId: string, chapterId: string) => {
    if (!confirm('Remove this chapter head? They stay on as a normal approved member.')) return
    setLoading(true)
    const result = await demoteChapterHead(headId)
    if (result.success) {
      setHeads(h => {
        const n = { ...h }
        delete n[chapterId]
        return n
      })
      close()
    } else {
      setError(result.error ?? 'Failed to remove.')
    }
    setLoading(false)
  }

  const head = selected ? heads[selected.chapter.id] : undefined
  const candidates = selected ? (membersByChapter[selected.chapter.id] ?? []).filter(m => m.id !== head?.id) : []

  return (
    <div className="space-y-8">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver/50" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search area, chapter, head, business..."
          aria-label="Search chapter heads"
          className="input-field pl-10 text-sm"
        />
      </div>
      {visibleAreas.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-brand-silver">No chapters match your search.</p>
        </div>
      ) : null}
      {visibleAreas.map(area => (
        <section key={area.id} aria-label={`${area.name} chapters`}>
          <h2 className="font-display text-xl font-bold text-brand-white mb-4">
            {area.name} <span className="text-brand-silver/50 text-sm font-normal">({area.chapters.length} chapters)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3">
            {area.chapters.map(chapter => {
              const h = heads[chapter.id]
              const label = `${area.name} ${chapter.name}`
              return h ? (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => openChapter(area, chapter)}
                  className="glass-card p-4 flex flex-col items-center gap-2 text-center hover:border-brand-gold/50 transition-all min-h-[220px] justify-center"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-brand-gold/40 flex-shrink-0">
                    {h.logo_url ? (
                      <Image src={h.logo_url} alt={h.business_name ?? h.full_name} fill className="object-cover" sizes="64px" unoptimized />
                    ) : (
                      <div className="w-full h-full bg-brand-gold/20 flex items-center justify-center">
                        <User className="w-7 h-7 text-brand-gold" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 w-full">
                    <div className="font-display font-bold text-brand-white truncate">{h.full_name}</div>
                    {h.business_name && <div className="text-brand-silver text-sm truncate">{h.business_name}</div>}
                    <div className="text-brand-champagne/80 text-xs mt-0.5">{label}</div>
                  </div>
                  <span className="badge flex-shrink-0">Chapter Head</span>
                </button>
              ) : (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => openChapter(area, chapter)}
                  className="rounded-xl border-2 border-dashed border-brand-gold/40 bg-brand-gold/10 hover:bg-brand-gold/20 transition-all px-4 py-5 text-center min-h-[220px] flex flex-col items-center justify-center gap-1"
                >
                  <span className="font-display font-semibold text-brand-gold text-sm">
                    + Add Chapter Head for {label}
                  </span>
                  {!chapter.is_active && (
                    <span className="text-brand-silver/60 text-xs mt-1">Chapter is currently inactive (Coming Soon)</span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      ))}

      {/* Detail / Assign Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/90 backdrop-blur-sm p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.area.name} ${selected.chapter.name} chapter head`}
        >
          <div
            className="glass-card max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="font-display text-xl font-bold text-brand-white">
                  {selected.area.name} {selected.chapter.name}
                </h3>
                <p className="text-brand-silver/60 text-xs mt-0.5">Chapter Head</p>
              </div>
              <button onClick={close} className="p-2 text-brand-silver hover:text-brand-white" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            {head ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-brand-gold/40 flex-shrink-0">
                    {head.logo_url ? (
                      <Image src={head.logo_url} alt={head.business_name ?? head.full_name} fill className="object-cover" sizes="80px" unoptimized />
                    ) : (
                      <div className="w-full h-full bg-brand-gold/20 flex items-center justify-center">
                        <User className="w-8 h-8 text-brand-gold" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold text-brand-white">{head.full_name}</div>
                    {head.business_name && <div className="text-brand-silver text-sm">{head.business_name}</div>}
                    {head.brand_tagline && <div className="text-brand-champagne/80 text-sm italic">{head.brand_tagline}</div>}
                  </div>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex gap-2"><dt className="text-brand-silver/60 w-20 flex-shrink-0">Email</dt><dd className="text-brand-white">{head.email}</dd></div>
                  {head.phone && <div className="flex gap-2"><dt className="text-brand-silver/60 w-20 flex-shrink-0">Phone</dt><dd className="text-brand-white">{head.phone}</dd></div>}
                  {head.business_address && <div className="flex gap-2"><dt className="text-brand-silver/60 w-20 flex-shrink-0">Address</dt><dd className="text-brand-white">{head.business_address}</dd></div>}
                  {head.bio && <div><dt className="text-brand-silver/60 text-xs uppercase tracking-wide mb-1">Bio</dt><dd className="text-brand-silver">{head.bio}</dd></div>}
                </dl>

                {/* Edit = swap to another member */}
                <div className="border-t border-brand-sapphire/50 pt-4">
                  <label htmlFor="swap_head" className="flex items-center gap-2 text-brand-silver text-sm font-medium mb-2">
                    <Pencil className="w-4 h-4" /> Replace with another member
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <SearchableSelect
                        value={assignId}
                        onChange={setAssignId}
                        options={candidates.map(m => ({ value: m.id, label: `${m.business_name ?? m.full_name} (${m.full_name})` }))}
                        placeholder="-- Select member --"
                        ariaLabel="Replace with member"
                      />
                    </div>
                    <button onClick={handleAssign} disabled={loading || !assignId} className="btn-primary text-sm px-5 flex items-center gap-2 disabled:opacity-50">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button
                  onClick={() => handleDemote(head.id, selected.chapter.id)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all disabled:opacity-40 min-h-[44px]"
                >
                  <UserMinus className="w-4 h-4" /> Remove Chapter Head (keeps them as member)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-brand-silver text-sm">
                  Promote an approved member of this chapter. They keep their business listing and gain head permissions immediately.
                </p>
                {candidates.length === 0 ? (
                  <p className="text-brand-silver/60 text-sm">No approved members in this chapter yet.</p>
                ) : (
                  <>
                    <div>
                      <label htmlFor="assign_head" className="block text-brand-silver text-sm font-medium mb-1">Select member *</label>
                      <SearchableSelect
                        id="assign_head"
                        value={assignId}
                        onChange={setAssignId}
                        options={candidates.map(m => ({ value: m.id, label: `${m.business_name ?? m.full_name} (${m.full_name})` }))}
                        placeholder="-- Select member --"
                        ariaLabel="Select member"
                      />
                    </div>
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                    <button onClick={handleAssign} disabled={loading || !assignId} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Assign Chapter Head
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
