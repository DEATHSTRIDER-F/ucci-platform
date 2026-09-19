'use client'

import Image from 'next/image'
import { Youtube, AlertCircle } from 'lucide-react'
import { extractYouTubeId, youTubeThumbnail } from '@/lib/utils/youtube'

export function GalleryYouTubeField({
  value,
  onChange,
  required,
  id = 'gallery_youtube',
}: {
  value: string
  onChange: (v: string) => void
  required: boolean
  id?: string
}) {
  const videoId = extractYouTubeId(value)
  const showError = value.trim() !== '' && !videoId

  return (
    <div>
      <label htmlFor={id} className="block text-brand-silver text-sm font-medium mb-1">
        YouTube Link {required ? '*' : <span className="text-brand-silver/50">(optional)</span>}
      </label>
      <div className="relative">
        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
        <input
          id={id}
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input-field pl-10"
          placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
        />
      </div>
      {showError && (
        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Invalid YouTube link. Thumbnail auto-fetches when valid.
        </p>
      )}
      {videoId && (
        <div className="mt-3 flex items-start gap-3">
          <div className="relative w-40 aspect-video rounded-lg overflow-hidden border border-brand-gold/30 flex-shrink-0">
            <Image src={youTubeThumbnail(videoId)} alt="YouTube thumbnail preview" fill className="object-cover" unoptimized />
          </div>
          <p className="text-green-400 text-xs mt-1">✓ Thumbnail auto-fetched from YouTube</p>
        </div>
      )}
    </div>
  )
}
