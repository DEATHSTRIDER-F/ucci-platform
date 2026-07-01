'use client'

import { useState } from 'react'
import { createCategory, updateCategory, deleteCategory } from '@/app/actions/categories'
import { Plus, Trash2, Loader2, Edit2, X, Check, Star } from 'lucide-react'
import type { Category } from '@/lib/types/database'

interface CategoriesManagerClientProps {
  categories: Category[]
}

const defaultForm = { name: '', slug: '', is_featured: false, meta_description: '', alt_text: '' }

export function CategoriesManagerClient({ categories: initial }: CategoriesManagerClientProps) {
  const [items, setItems] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const autoSlug = (name: string) =>
    name.toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-')

  const handleCreate = async () => {
    if (!form.name.trim()) { setErrors({ name: 'Category name is required.' }); return }
    setErrors({})
    setLoading('create')
    const result = await createCategory({ ...form, slug: form.slug || autoSlug(form.name) })
    if (result.success && result.data) {
      setItems(i => [...i, result.data!].sort((a, b) => a.name.localeCompare(b.name)))
      setShowAdd(false); setForm(defaultForm)
    } else { setErrors({ submit: result.error ?? 'Failed.' }) }
    setLoading(null)
  }

  const handleUpdate = async (id: string) => {
    if (!form.name.trim()) { setErrors({ name: 'Name is required.' }); return }
    setErrors({})
    setLoading(`upd-${id}`)
    const result = await updateCategory(id, form)
    if (result.success && result.data) {
      setItems(i => i.map(c => c.id === id ? result.data! : c))
      setEditingId(null)
    } else { setErrors({ submit: result.error ?? 'Failed.' }) }
    setLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? This cannot be undone.')) return
    setLoading(`del-${id}`)
    const result = await deleteCategory(id)
    if (result.success) setItems(i => i.filter(c => c.id !== id))
    setLoading(null)
  }

  const FormFields = ({ isNew, id }: { isNew: boolean; id?: string }) => (
    <div className="glass-card p-5 space-y-3 border-brand-gold/40">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-brand-silver text-xs font-medium mb-1">Category Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug || autoSlug(e.target.value) }))}
            className="input-field text-sm"
            placeholder="Chartered Accountant"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-brand-silver text-xs font-medium mb-1">Slug</label>
          <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input-field text-sm" placeholder="chartered-accountant" />
        </div>
      </div>
      <div>
        <label className="block text-brand-silver text-xs font-medium mb-1">Meta Description</label>
        <textarea value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} className="input-field text-sm min-h-[80px] resize-none" placeholder="Find verified chartered accountants..." />
      </div>
      <div>
        <label className="block text-brand-silver text-xs font-medium mb-1">Image Alt Text <span className="text-brand-silver/50">(for future category images)</span></label>
        <input type="text" value={form.alt_text} onChange={e => setForm(f => ({ ...f, alt_text: e.target.value }))} className="input-field text-sm" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 accent-brand-gold" />
        <span className="text-brand-silver text-sm">Featured in navigation</span>
      </label>
      {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}
      <div className="flex gap-2">
        <button onClick={isNew ? handleCreate : () => handleUpdate(id!)} disabled={!!loading} className="btn-primary text-sm py-2 flex items-center gap-1">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {isNew ? 'Create' : 'Save'}
        </button>
        <button onClick={() => { setShowAdd(false); setEditingId(null); setForm(defaultForm) }} className="btn-ghost text-sm">
          <X className="w-4 h-4 mr-1" /> Cancel
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {!showAdd && !editingId && (
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      )}
      {showAdd && <FormFields isNew={true} />}

      <table className="admin-table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Featured</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(cat => (
            editingId === cat.id ? (
              <tr key={cat.id}>
                <td colSpan={4}>
                  <FormFields isNew={false} id={cat.id} />
                </td>
              </tr>
            ) : (
              <tr key={cat.id}>
                <td className="text-brand-white font-medium">{cat.name}</td>
                <td className="text-brand-silver/60 text-xs">{cat.slug}</td>
                <td>{cat.is_featured && <Star className="w-4 h-4 text-brand-gold" />}</td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditingId(cat.id); setForm({ name: cat.name, slug: cat.slug, is_featured: cat.is_featured, meta_description: cat.meta_description ?? '', alt_text: cat.alt_text ?? '' }) }}
                      className="p-1.5 text-brand-silver hover:text-brand-gold transition-colors"
                      aria-label="Edit category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={loading === `del-${cat.id}`}
                      className="p-1.5 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                      aria-label="Delete category"
                    >
                      {loading === `del-${cat.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  )
}
