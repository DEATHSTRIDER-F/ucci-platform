'use client'

import { useState } from 'react'
import { createCategory, updateCategory, deleteCategory } from '@/app/actions/categories'
import { Plus, Trash2, Loader2, Edit2, Star, AlertCircle, CheckCircle } from 'lucide-react'
import { CategoryIcon } from '@/components/category-icon'
import type { CategoryFormState } from '@/components/admin/CategoryForm'
import type { Category } from '@/lib/types/database'
import dynamic from 'next/dynamic'

const CategoryForm = dynamic(() => import('@/components/admin/CategoryForm').then(m => m.CategoryForm), {
  ssr: false,
  loading: () => <div className="glass-card p-8 flex items-center justify-center text-brand-silver/60 text-sm">Loading form…</div>,
})

interface CategoriesManagerClientProps {
  categories: Category[]
}

const DEFAULT_COLOR = '#D4AF37'

const defaultForm: CategoryFormState = {
  name: '',
  slug: '',
  is_featured: false,
  meta_description: '',
  alt_text: '',
  icon_name: '',
  icon_color: DEFAULT_COLOR,
}

export function CategoriesManagerClient({ categories: initial }: CategoriesManagerClientProps) {
  const [items, setItems] = useState<Category[]>(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryFormState>(defaultForm)
  const [loading, setLoading] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const autoSlug = (name: string) =>
    name.toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+|-+$/g, '')

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const validateClient = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Category name is required.'
    if (form.icon_color && !/^#[0-9A-Fa-f]{6}$/.test(form.icon_color)) e.icon_color = 'Color must be #RRGGBB.'
    // Allow Lucide PascalCase OR Iconify prefix:name
    if (form.icon_name && !/^([A-Za-z][A-Za-z0-9]*|[a-z0-9-]+:[a-z0-9-]+)$/.test(form.icon_name)) e.icon_name = 'Invalid icon name.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = async () => {
    if (!validateClient()) return
    setErrors({})
    setLoading('create')
    const payload = { ...form, slug: form.slug || autoSlug(form.name) }
    const result = await createCategory(payload)
    if (result.success && result.data) {
      setItems(i => [...i, result.data!].sort((a, b) => a.name.localeCompare(b.name)))
      setShowAdd(false)
      setForm(defaultForm)
      showToast('success', `Category "${result.data.name}" created.`)
    } else {
      setErrors({ submit: result.error ?? 'Failed to create category.' })
      showToast('error', result.error ?? 'Failed to create category.')
    }
    setLoading(null)
  }

  const handleUpdate = async (id: string) => {
    if (!validateClient()) return
    setErrors({})
    setLoading(`upd-${id}`)
    const payload = { ...form, slug: form.slug || autoSlug(form.name) }
    const result = await updateCategory(id, payload)
    if (result.success && result.data) {
      setItems(i => i.map(c => c.id === id ? result.data! : c).sort((a, b) => a.name.localeCompare(b.name)))
      setEditingId(null)
      setForm(defaultForm)
      showToast('success', `Category "${result.data.name}" updated.`)
    } else {
      setErrors({ submit: result.error ?? 'Failed to update.' })
      showToast('error', result.error ?? 'Failed to update.')
    }
    setLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? This cannot be undone.')) return
    setLoading(`del-${id}`)
    const result = await deleteCategory(id)
    if (result.success) {
      setItems(i => i.filter(c => c.id !== id))
      showToast('success', 'Category deleted.')
    } else {
      showToast('error', result.error ?? 'Failed to delete.')
    }
    setLoading(null)
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setShowAdd(false)
    setErrors({})
    setForm({
      name: cat.name,
      slug: cat.slug,
      is_featured: cat.is_featured,
      meta_description: cat.meta_description ?? '',
      alt_text: cat.alt_text ?? '',
      icon_name: (cat as unknown as { icon_name?: string }).icon_name ?? '',
      icon_color: (cat as unknown as { icon_color?: string }).icon_color ?? DEFAULT_COLOR,
    })
  }

  const cancelForm = () => {
    setShowAdd(false)
    setEditingId(null)
    setForm(defaultForm)
    setErrors({})
  }

  return (
    <div className="space-y-4 overflow-x-hidden">
      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border animate-fade-in ${
            toast.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.message}
        </div>
      )}

      {!showAdd && !editingId && (
        <button onClick={() => { setShowAdd(true); setErrors({}) }} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      )}
      {showAdd && <CategoryForm form={form} setForm={setForm} errors={errors} loading={loading} isNew={true} onCreate={handleCreate} onUpdate={handleUpdate} onCancel={cancelForm} />}

      {/* Table wrapper — prevent horizontal overflow, allow scroll on mobile */}
      <div className="overflow-x-auto -mx-1 sm:mx-0 rounded-xl border border-brand-sapphire/50">
        <table className="admin-table w-full min-w-[520px]">
          <thead>
            <tr>
              <th className="whitespace-nowrap">Category</th>
              <th>Slug</th>
              <th>Featured</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-brand-silver/60 text-sm">No categories yet. Create your first one.</td>
              </tr>
            ) : (
              items.map(cat => {
                const iconName = (cat as unknown as { icon_name?: string | null }).icon_name
                const iconColor = (cat as unknown as { icon_color?: string | null }).icon_color
                return editingId === cat.id ? (
                  <tr key={cat.id}>
                    <td colSpan={4} className="p-0">
                      <div className="p-3 sm:p-0">
                        <CategoryForm form={form} setForm={setForm} errors={errors} loading={loading} isNew={false} id={cat.id} onCreate={handleCreate} onUpdate={handleUpdate} onCancel={cancelForm} />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={cat.id}>
                    <td>
                      <div className="flex items-center gap-3 min-w-0">
                        <CategoryIcon name={iconName} color={iconColor} size={18} className="shrink-0" />
                        <span className="text-brand-white font-medium truncate">{cat.name}</span>
                      </div>
                    </td>
                    <td className="text-brand-silver/60 text-xs font-mono max-w-[140px] truncate">{cat.slug}</td>
                    <td>{cat.is_featured ? <Star className="w-4 h-4 text-brand-gold" /> : <span className="text-brand-silver/30">—</span>}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-brand-silver hover:text-brand-gold hover:bg-brand-sapphire/50 rounded-lg transition-colors"
                          aria-label={`Edit ${cat.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={loading === `del-${cat.id}`}
                          className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          aria-label={`Delete ${cat.name}`}
                        >
                          {loading === `del-${cat.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
