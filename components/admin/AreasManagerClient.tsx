'use client'

import { useState } from 'react'
import { createArea, updateArea, createChapter, deleteChapter } from '@/app/actions/areas'
import { Plus, Trash2, Loader2, ChevronDown, ChevronRight, Edit2 } from 'lucide-react'
import type { Area, Chapter } from '@/lib/types/database'

type AreaWithChapters = Area & { chapters: Chapter[] }

export function AreasManagerClient({ areas: initial }: { areas: AreaWithChapters[] }) {
  const [areas, setAreas] = useState(initial)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<string | null>(null)
  const [newArea, setNewArea] = useState({ name: '', slug: '' })
  const [newChapter, setNewChapter] = useState<Record<string, { name: string; slug: string }>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const autoSlug = (name: string) => name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  const toggle = (id: string) => setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const handleAddArea = async () => {
    if (!newArea.name.trim()) { setErrors({ area: 'Area name required.' }); return }
    setErrors({})
    setLoading('area')
    const result = await createArea({ name: newArea.name, slug: newArea.slug || autoSlug(newArea.name) })
    if (result.success && result.data) {
      setAreas(a => [...a, { ...result.data!, chapters: [] }])
      setNewArea({ name: '', slug: '' })
    } else { setErrors({ area: result.error ?? 'Failed.' }) }
    setLoading(null)
  }

  const handleAddChapter = async (areaId: string) => {
    const ch = newChapter[areaId]
    if (!ch?.name?.trim()) { setErrors({ [`ch-${areaId}`]: 'Chapter name required.' }); return }
    setErrors({})
    setLoading(`ch-${areaId}`)
    const result = await createChapter({ name: ch.name, slug: ch.slug || autoSlug(ch.name), area_id: areaId })
    if (result.success && result.data) {
      setAreas(as => as.map(a => a.id === areaId ? { ...a, chapters: [...a.chapters, result.data!] } : a))
      setNewChapter(n => ({ ...n, [areaId]: { name: '', slug: '' } }))
    } else { setErrors({ [`ch-${areaId}`]: result.error ?? 'Failed.' }) }
    setLoading(null)
  }

  const handleDeleteChapter = async (areaId: string, chapterId: string, name: string) => {
    if (!confirm(`Delete chapter "${name}"? Members in this chapter will lose their chapter association.`)) return
    setLoading(`del-ch-${chapterId}`)
    const result = await deleteChapter(chapterId)
    if (result.success) {
      setAreas(as => as.map(a => a.id === areaId ? { ...a, chapters: a.chapters.filter(c => c.id !== chapterId) } : a))
    }
    setLoading(null)
  }

  return (
    <div className="space-y-5">
      {/* Add Area */}
      <div className="glass-card p-5">
        <h2 className="font-display text-lg font-bold text-brand-white mb-3">Add Area</h2>
        <div className="flex gap-3 flex-wrap">
          <input type="text" value={newArea.name} onChange={e => setNewArea(n => ({ ...n, name: e.target.value, slug: n.slug || autoSlug(e.target.value) }))} className="input-field flex-1 min-w-48" placeholder="Area name (e.g. Pune)" />
          <input type="text" value={newArea.slug} onChange={e => setNewArea(n => ({ ...n, slug: e.target.value }))} className="input-field w-40" placeholder="Slug (auto)" />
          <button onClick={handleAddArea} disabled={loading === 'area'} className="btn-primary flex items-center gap-2">
            {loading === 'area' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Area
          </button>
        </div>
        {errors.area && <p className="text-red-400 text-xs mt-2">{errors.area}</p>}
      </div>

      {/* Areas List */}
      {areas.map(area => (
        <div key={area.id} className="glass-card overflow-hidden">
          <button
            onClick={() => toggle(area.id)}
            className="w-full flex items-center justify-between px-6 py-4 text-brand-white font-medium hover:bg-brand-navy/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              {expanded.has(area.id) ? <ChevronDown className="w-5 h-5 text-brand-gold" /> : <ChevronRight className="w-5 h-5 text-brand-gold" />}
              <span className="font-display text-lg">{area.name}</span>
              <span className="text-brand-silver/60 text-sm">({area.chapters.length} chapters)</span>
            </div>
          </button>

          {expanded.has(area.id) && (
            <div className="border-t border-brand-sapphire/50 p-5 space-y-3">
              {/* Chapters */}
              {area.chapters.map(ch => (
                <div key={ch.id} className="flex items-center justify-between bg-brand-navy/40 rounded-lg px-4 py-3">
                  <div>
                    <span className="text-brand-white text-sm font-medium">{ch.name}</span>
                    <span className="text-brand-silver/50 text-xs ml-2">/{ch.slug}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteChapter(area.id, ch.id, ch.name)}
                    disabled={loading === `del-ch-${ch.id}`}
                    className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50"
                    aria-label="Delete chapter"
                  >
                    {loading === `del-ch-${ch.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}

              {/* Add Chapter */}
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  value={newChapter[area.id]?.name ?? ''}
                  onChange={e => setNewChapter(n => ({ ...n, [area.id]: { name: e.target.value, slug: n[area.id]?.slug || autoSlug(e.target.value) } }))}
                  className="input-field flex-1 min-w-36 text-sm"
                  placeholder="New chapter name"
                />
                <input
                  type="text"
                  value={newChapter[area.id]?.slug ?? ''}
                  onChange={e => setNewChapter(n => ({ ...n, [area.id]: { ...n[area.id], slug: e.target.value } }))}
                  className="input-field w-32 text-sm"
                  placeholder="Slug (auto)"
                />
                <button onClick={() => handleAddChapter(area.id)} disabled={loading === `ch-${area.id}`} className="btn-outline text-sm py-2 px-4 flex items-center gap-1">
                  {loading === `ch-${area.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Chapter
                </button>
              </div>
              {errors[`ch-${area.id}`] && <p className="text-red-400 text-xs">{errors[`ch-${area.id}`]}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
