'use client'

import { AlertCircle, Check, Loader2, Star, X } from 'lucide-react'
import { IconPicker } from '@/components/admin/icon-picker'

const slugify = (name: string) =>
  name.toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+|-+$/g, '')

export type CategoryFormState = {
  name: string
  slug: string
  is_featured: boolean
  meta_description: string
  alt_text: string
  icon_name: string
  icon_color: string
}

interface Props {
  form: CategoryFormState
  setForm: React.Dispatch<React.SetStateAction<CategoryFormState>>
  errors: Record<string, string>
  loading: string | null
  isNew: boolean
  id?: string
  onCreate: () => void
  onUpdate: (id: string) => void
  onCancel: () => void
}

export function CategoryForm({ form, setForm, errors, loading, isNew, id, onCreate, onUpdate, onCancel }: Props) {
  return (
    <div className="glass-card p-5 sm:p-6 space-y-4 border-brand-gold/40 overflow-x-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="min-w-0">
          <label htmlFor={`cat-name-${id ?? 'new'}`} className="block text-brand-silver text-xs font-medium mb-1.5">
            Category Name <span className="text-brand-gold">*</span>
          </label>
          <input
            id={`cat-name-${id ?? 'new'}`}
            type="text"
            value={form.name}
            onChange={e => {
              const v = e.target.value
              setForm(f => ({
                ...f,
                name: v,
                slug: !f.slug || f.slug === slugify(f.name) ? slugify(v) : f.slug,
              }))
            }}
            className="input-field text-sm"
            placeholder="Chartered Accountant"
            autoComplete="off"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
        </div>
        <div className="min-w-0">
          <label htmlFor={`cat-slug-${id ?? 'new'}`} className="block text-brand-silver text-xs font-medium mb-1.5">
            Slug <span className="text-brand-silver/50 font-normal">(auto-generated)</span>
          </label>
          <input
            id={`cat-slug-${id ?? 'new'}`}
            type="text"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
            className="input-field text-sm font-mono"
            placeholder="chartered-accountant"
            autoComplete="off"
          />
        </div>
      </div>

      <IconPicker
        value={form.icon_name || null}
        color={form.icon_color}
        onIconChange={name => setForm(f => ({ ...f, icon_name: name }))}
        onColorChange={color => setForm(f => ({ ...f, icon_color: color }))}
      />
      {(errors.icon_name || errors.icon_color) && (
        <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.icon_name || errors.icon_color}</p>
      )}

      <div className="space-y-3">
        <div>
          <label htmlFor={`cat-meta-${id ?? 'new'}`} className="block text-brand-silver text-xs font-medium mb-1.5">Meta Description</label>
          <textarea
            id={`cat-meta-${id ?? 'new'}`}
            value={form.meta_description}
            onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
            className="input-field text-sm min-h-[80px] resize-none"
            placeholder="Find verified chartered accountants..."
            maxLength={300}
          />
          <p className="text-brand-silver/40 text-xs mt-1 text-right">{form.meta_description.length}/300</p>
        </div>
        <div>
          <label htmlFor={`cat-alt-${id ?? 'new'}`} className="block text-brand-silver text-xs font-medium mb-1.5">
            Image Alt Text <span className="text-brand-silver/50 font-normal">(for future category images)</span>
          </label>
          <input
            id={`cat-alt-${id ?? 'new'}`}
            type="text"
            value={form.alt_text}
            onChange={e => setForm(f => ({ ...f, alt_text: e.target.value }))}
            className="input-field text-sm"
            placeholder="Icon alt text for accessibility"
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer group min-h-[44px]">
        <input
          type="checkbox"
          checked={form.is_featured}
          onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
          className="w-4 h-4 accent-brand-gold rounded"
        />
        <span className="text-brand-silver text-sm group-hover:text-brand-white transition-colors">Featured in navigation</span>
        {form.is_featured && <Star className="w-3.5 h-3.5 text-brand-gold" />}
      </label>

      {errors.submit && (
        <div className="flex items-start gap-2 text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{errors.submit}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
        <button
          onClick={isNew ? onCreate : () => onUpdate(id!)}
          disabled={!!loading}
          className="btn-primary text-sm py-2.5 flex items-center justify-center gap-2 flex-1 sm:flex-initial min-h-[44px] disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {isNew ? 'Create Category' : 'Save Changes'}
        </button>
        <button
          onClick={onCancel}
          disabled={!!loading}
          className="btn-ghost text-sm flex items-center justify-center gap-1.5 min-h-[44px] border border-brand-silver/10 rounded-lg sm:border-0 disabled:opacity-50"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  )
}
