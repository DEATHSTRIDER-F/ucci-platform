'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { compressImage, validateImageFile } from '@/lib/utils/imageCompressor'
import { updateMemberLogo } from '@/app/actions/admin'
import { Upload, Loader2, User, Trash2 } from 'lucide-react'

export function MemberLogoUploader({ profileId, logoUrl }: { profileId: string; logoUrl: string | null }) {
  const [current, setCurrent] = useState(logoUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const upload = useCallback(async (file: File) => {
    const validation = validateImageFile(file)
    if (!validation.valid) { setError(validation.error!); return }
    setError('')
    setLoading(true)
    try {
      const compressed = await compressImage(file, { maxSizeKB: 100 })
      const b64: string = await new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = () => res(reader.result as string)
        reader.onerror = rej
        reader.readAsDataURL(compressed)
      })
      const result = await updateMemberLogo(profileId, b64)
      if (result.success) {
        setCurrent(result.data || null)
      } else {
        setError(result.error ?? 'Upload failed.')
      }
    } catch {
      setError('Failed to process image. Please try a different file.')
    } finally {
      setLoading(false)
    }
  }, [profileId])

  const handleRemove = async () => {
    if (!confirm('Remove this member photo?')) return
    setLoading(true)
    const result = await updateMemberLogo(profileId, null)
    if (result.success) setCurrent(null)
    else setError(result.error ?? 'Failed to remove.')
    setLoading(false)
  }

  return (
    <div className="flex flex-col sm:flex-row items-start gap-6">
      <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-brand-gold/40 flex-shrink-0">
        {current ? (
          <Image src={current} alt="Member photo" fill className="object-cover" sizes="96px" />
        ) : (
          <div className="w-full h-full bg-brand-gold/20 flex items-center justify-center">
            <User className="w-10 h-10 text-brand-gold" />
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-brand-navy/70 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor={`member_logo_${profileId}`} className="btn-outline text-sm py-2 px-4 cursor-pointer inline-flex items-center gap-2">
            <Upload className="w-4 h-4" /> {current ? 'Change Photo' : 'Upload Photo'}
          </label>
          <input
            id={`member_logo_${profileId}`}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={loading}
            onChange={e => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = '' }}
          />
          {current && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={loading}
              className="text-sm text-red-400 hover:text-red-300 px-3 py-2 inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          )}
        </div>
        <p className="text-brand-silver/60 text-xs mt-1.5">WebP · Max 100KB · Auto-optimized · Visible publicly</p>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    </div>
  )
}
