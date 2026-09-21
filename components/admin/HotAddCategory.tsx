'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { createCategory } from '@/app/actions/categories'
import { Loader2, Plus, X } from 'lucide-react'

const IconPicker = dynamic(() => import('@/components/admin/icon-picker').then(m => m.IconPicker), { ssr: false })

export interface HotCategory {
  id: string
  name: string
}

/**
 * Inline category creation for admin member forms (super-admin only —
 * parent decides whether to render). Creates with icon + color and
 * hands the new category back so the form can select it immediately.
 */
export function HotAddCategory({ onCreated }: { onCreated: (cat: HotCategory) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [color, setColor] = useState('#D4AF37')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setOpen(false)
    setName('')
    setIcon('')
    setColor('#D4AF37')
    setError('')
  }

  const handleCreate = async () => {
    if (!name.trim()) { setError('Category name is required.'); return }
    setSaving(true)
    setError('')
    const slug = name.toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+|-+$/g, '')
    const result = await createCategory({
      name: name.trim(),
      slug,
      is_featured: false,
      meta_description: '',
      alt_text: name.trim(),
      icon_name: icon || null,
      icon_color: color || null,
    })
    setSaving(false)
    if (result.success && result.data) {
      onCreated({ id: result.data.id, name: result.data.name })
      reset()
    } else {
      setError(result.error ?? 'Failed to create category.')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-brand-gold hover:text-brand-champagne inline-flex items-center gap-1 py-1"
      >
        <Plus className="w-3.5 h-3.5" /> New category
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-navy/90 backdrop-blur-sm p-4"
          onClick={() => !saving && reset()}
          role="dialog"
          aria-modal="true"
          aria-label="Create category"
        >
          <div
            className="glass-card max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="font-display text-lg font-bold text-brand-white">New Category</h3>
              <button onClick={reset} disabled={saving} className="p-1.5 text-brand-silver hover:text-brand-white" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="hot_cat_name" className="block text-brand-silver text-sm font-medium mb-1">Name *</label>
                <input
                  id="hot_cat_name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field text-sm"
                  placeholder="e.g. Interior Designer"
                />
              </div>
              <IconPicker
                value={icon}
                color={color}
                onIconChange={setIcon}
                onColorChange={setColor}
                label="Icon & Color"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button onClick={handleCreate} disabled={saving} className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create & Select
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
