'use client'

import { useState } from 'react'
import { createArea, updateArea, createChapter, deleteChapter, reorderAreas, reorderChapters, toggleChapterActive } from '@/app/actions/areas'
import { Plus, Trash2, Loader2, ChevronDown, ChevronRight, Edit2, GripVertical, Eye, EyeOff } from 'lucide-react'
import { dragRowClass } from '@/components/admin/useDragSort'
import type { Area, Chapter } from '@/lib/types/database'

type AreaWithChapters = Area & { chapters: Chapter[] }

interface DragPos { kind: 'area' | 'chapter'; areaId: string | null; index: number }

export function AreasManagerClient({ areas: initial }: { areas: AreaWithChapters[] }) {
  const [areas, setAreas] = useState(initial)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<string | null>(null)
  const [newArea, setNewArea] = useState({ name: '', slug: '' })
  const [newChapter, setNewChapter] = useState<Record<string, { name: string; slug: string }>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dragPos, setDragPos] = useState<DragPos | null>(null)
  const [overPos, setOverPos] = useState<DragPos | null>(null)

  const samePos = (a: DragPos | null, b: DragPos | null) =>
    !!a && !!b && a.kind === b.kind && a.areaId === b.areaId && a.index === b.index

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

  const handleToggleChapter = async (areaId: string, chapterId: string, current: boolean) => {
    setLoading(`toggle-ch-${chapterId}`)
    const result = await toggleChapterActive(chapterId, !current)
    if (result.success) {
      setAreas(as => as.map(a => a.id === areaId ? { ...a, chapters: a.chapters.map(c => c.id === chapterId ? { ...c, is_active: !current } : c) } : a))
    }
    setLoading(null)
  }

  // ─── Drag-and-drop ordering (native HTML5, no deps) ───
  const dragStart = (pos: DragPos) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify(pos))
    setDragPos(pos)
  }
  const dragOver = (pos: DragPos) => (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!samePos(overPos, pos)) setOverPos(pos)
  }
  const dragEnd = () => { setDragPos(null); setOverPos(null) }

  const dropArea = (toIndex: number) => async (e: React.DragEvent) => {
    e.preventDefault()
    const from = dragPos
    setDragPos(null); setOverPos(null)
    if (!from || from.kind !== 'area' || from.index === toIndex) return
    const next = [...areas]
    const [moved] = next.splice(from.index, 1)
    next.splice(toIndex, 0, moved)
    const ordered = next.map((a, i) => ({ ...a, display_order: i }))
    setAreas(ordered)
    await reorderAreas(ordered.map(a => ({ id: a.id, display_order: a.display_order })))
  }

  const dropChapter = (areaId: string, toIndex: number) => async (e: React.DragEvent) => {
    e.preventDefault()
    const from = dragPos
    setDragPos(null); setOverPos(null)
    if (!from || from.kind !== 'chapter' || from.areaId !== areaId || from.index === toIndex) return
    setAreas(as => {
      const area = as.find(a => a.id === areaId)
      if (!area) return as
      const next = [...area.chapters]
      const [moved] = next.splice(from.index, 1)
      next.splice(toIndex, 0, moved)
      const ordered = next.map((c, i) => ({ ...c, display_order: i }))
      void reorderChapters(ordered.map(c => ({ id: c.id, display_order: c.display_order })))
      return as.map(a => a.id === areaId ? { ...a, chapters: ordered } : a)
    })
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

      {/* Areas List — drag to reorder */}
      {areas.map((area, areaIdx) => (
        <div
          key={area.id}
          className={`glass-card overflow-hidden transition-opacity ${dragRowClass(samePos(dragPos, { kind: 'area', areaId: null, index: areaIdx }), samePos(overPos, { kind: 'area', areaId: null, index: areaIdx }) && !samePos(dragPos, { kind: 'area', areaId: null, index: areaIdx }))}`}
          draggable
          onDragStart={dragStart({ kind: 'area', areaId: null, index: areaIdx })}
          onDragOver={dragOver({ kind: 'area', areaId: null, index: areaIdx })}
          onDrop={dropArea(areaIdx)}
          onDragEnd={dragEnd}
        >
          <button
            onClick={() => toggle(area.id)}
            className="w-full flex items-center justify-between px-6 py-4 text-brand-white font-medium hover:bg-brand-navy/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <GripVertical
                className="w-5 h-5 text-brand-silver/30 cursor-grab active:cursor-grabbing"
                onClick={e => e.stopPropagation()}
              />
              {expanded.has(area.id) ? <ChevronDown className="w-5 h-5 text-brand-gold" /> : <ChevronRight className="w-5 h-5 text-brand-gold" />}
              <span className="font-display text-lg">{area.name}</span>
              <span className="text-brand-silver/60 text-sm">({area.chapters.length} chapters)</span>
            </div>
          </button>

          {expanded.has(area.id) && (
            <div className="border-t border-brand-sapphire/50 p-5 space-y-3" onClick={e => e.stopPropagation()}>
              {/* Chapters — drag to reorder within area */}
              {area.chapters.map((ch, chIdx) => {
                const chActive = (ch as Chapter & { is_active?: boolean }).is_active !== false
                return (
                <div
                  key={ch.id}
                  draggable
                  onDragStart={dragStart({ kind: 'chapter', areaId: area.id, index: chIdx })}
                  onDragOver={dragOver({ kind: 'chapter', areaId: area.id, index: chIdx })}
                  onDrop={dropChapter(area.id, chIdx)}
                  onDragEnd={dragEnd}
                  title="Drag to reorder"
                  className={`flex items-center justify-between gap-3 bg-brand-navy/40 rounded-lg px-4 py-3 transition-opacity ${dragRowClass(samePos(dragPos, { kind: 'chapter', areaId: area.id, index: chIdx }), samePos(overPos, { kind: 'chapter', areaId: area.id, index: chIdx }) && !samePos(dragPos, { kind: 'chapter', areaId: area.id, index: chIdx }))}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GripVertical className="w-4 h-4 text-brand-silver/30 cursor-grab active:cursor-grabbing flex-shrink-0" />
                    <span className={`text-sm font-medium truncate ${chActive ? 'text-brand-white' : 'text-brand-silver/50'}`}>{ch.name}</span>
                    <span className="text-brand-silver/50 text-xs ml-1">/{ch.slug}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${chActive ? 'bg-green-500/15 text-green-300 border-green-500/30' : 'bg-brand-gold/15 text-brand-champagne border-brand-gold/30'}`}>
                      {chActive ? 'Active' : 'Coming Soon'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleChapter(area.id, ch.id, chActive)}
                      disabled={loading === `toggle-ch-${ch.id}`}
                      className="text-brand-silver hover:text-brand-gold p-1.5 disabled:opacity-50"
                      title={chActive ? 'Set inactive (Coming Soon)' : 'Set active'}
                      aria-label={chActive ? `Deactivate ${ch.name}` : `Activate ${ch.name}`}
                    >
                      {loading === `toggle-ch-${ch.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : chActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(area.id, ch.id, ch.name)}
                      disabled={loading === `del-ch-${ch.id}`}
                      className="text-red-400 hover:text-red-300 p-1.5 disabled:opacity-50"
                      aria-label="Delete chapter"
                    >
                      {loading === `del-ch-${ch.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                )
              })}

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
