'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function GalleryAdminSearch({ query, type }: { query: string; type: string }) {
  const [value, setValue] = useState(query)
  const router = useRouter()

  const go = (v: string) => {
    const params = new URLSearchParams()
    if (type !== 'all') params.set('type', type)
    if (v.trim()) params.set('q', v.trim())
    const qs = params.toString()
    router.replace(`/admin/gallery${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="relative max-w-md mb-6">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver/50" />
      <input
        type="text"
        value={value}
        onChange={e => { setValue(e.target.value); go(e.target.value) }}
        placeholder="Search title, description..."
        aria-label="Search gallery posts"
        className="input-field pl-10 text-sm"
      />
    </div>
  )
}
