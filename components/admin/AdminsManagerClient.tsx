'use client'

import { useState } from 'react'
import { createChapterAdmin, deleteChapterAdmin } from '@/app/actions/admin'
import { Plus, Trash2, Loader2, User, Check, X, Eye, EyeOff } from 'lucide-react'

interface AdminItem {
  id: string
  full_name: string
  email: string
  role: string
  chapter?: { name: string; area?: { name: string } } | null
}

interface AdminsManagerClientProps {
  admins: AdminItem[]
  chapters: Array<{ id: string; name: string; slug: string; area?: { name: string } | null }>
}

export function AdminsManagerClient({ admins: initial, chapters }: AdminsManagerClientProps) {
  const [admins, setAdmins] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ email: '', full_name: '', chapter_id: '', password: '' })

  const handleCreate = async () => {
    const e: Record<string, string> = {}
    if (!form.email.trim()) e.email = 'Email required'
    if (!form.full_name.trim()) e.name = 'Name required'
    if (!form.chapter_id) e.chapter = 'Chapter required'
    if (!form.password || form.password.length < 8) e.pass = 'Password must be at least 8 characters'
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading('create')
    const result = await createChapterAdmin(form)
    if (result.success) {
      // Refresh by showing placeholder
      setAdmins(a => [...a, {
        id: Date.now().toString(),
        email: form.email,
        full_name: form.full_name,
        role: 'chapter_admin',
        chapter: chapters.find(c => c.id === form.chapter_id) ?? null,
      } as AdminItem])
      setShowAdd(false); setForm({ email: '', full_name: '', chapter_id: '', password: '' })
    } else {
      setErrors({ submit: result.error ?? 'Failed to create admin.' })
    }
    setLoading(null)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete admin "${name}"? This will also delete their auth account.`)) return
    setLoading(`del-${id}`)
    const result = await deleteChapterAdmin(id)
    if (result.success) setAdmins(a => a.filter(ad => ad.id !== id))
    setLoading(null)
  }

  return (
    <div className="space-y-5">
      {!showAdd && (
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Chapter Admin
        </button>
      )}

      {showAdd && (
        <div className="glass-card p-6 space-y-4 border-brand-gold/40">
          <h2 className="font-display text-lg font-bold text-brand-white">New Chapter Admin</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-brand-silver text-sm font-medium mb-1">Full Name *</label>
              <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="input-field" placeholder="Rahul Sharma" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-brand-silver text-sm font-medium mb-1">Email Address *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="admin@ucci.in" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-brand-silver text-sm font-medium mb-1">Assign to Chapter *</label>
              <select value={form.chapter_id} onChange={e => setForm(f => ({ ...f, chapter_id: e.target.value }))} className="input-field">
                <option value="">-- Select Chapter --</option>
                {chapters.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.area?.name} — {ch.name}</option>
                ))}
              </select>
              {errors.chapter && <p className="text-red-400 text-xs mt-1">{errors.chapter}</p>}
            </div>
            <div>
              <label className="block text-brand-silver text-sm font-medium mb-1">Initial Password *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input-field pr-10" placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver/60 hover:text-brand-silver">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.pass && <p className="text-red-400 text-xs mt-1">{errors.pass}</p>}
            </div>
          </div>
          {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={loading === 'create'} className="btn-primary flex items-center gap-2">
              {loading === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create Admin
            </button>
            <button onClick={() => { setShowAdd(false); setErrors({}) }} className="btn-ghost">
              <X className="w-4 h-4 mr-1" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {admins.length === 0 ? (
          <div className="glass-card p-10 text-center text-brand-silver">No chapter admins yet.</div>
        ) : (
          admins.map(admin => (
            <div key={admin.id} className="glass-card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-brand-gold" />
              </div>
              <div className="flex-1">
                <div className="text-brand-white font-medium">{admin.full_name}</div>
                <div className="text-brand-silver text-sm">{admin.email}</div>
                {admin.chapter && (
                  <div className="text-brand-silver/60 text-xs mt-0.5">
                    {admin.chapter.name} Chapter · {admin.chapter.area?.name}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(admin.id, admin.full_name)}
                disabled={loading === `del-${admin.id}`}
                className="p-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                aria-label="Delete admin"
              >
                {loading === `del-${admin.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
