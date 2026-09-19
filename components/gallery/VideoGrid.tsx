'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { youTubeThumbnail, youTubeEmbedUrl } from '@/lib/utils/youtube'
import { formatDate } from '@/lib/utils/utils'

export interface VideoItem {
  id: string
  title: string
  content: string | null
  youtube_video_id: string
  created_at: string
  chapter?: { name: string } | Array<{ name: string }> | null
  area?: { name: string } | Array<{ name: string }> | null
}

function unwrap<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null
  return Array.isArray(v) ? v[0] ?? null : v
}

export function VideoCard({ video, eager = false }: { video: VideoItem; eager?: boolean }) {
  const [playing, setPlaying] = useState(false)
  const chapter = unwrap(video.chapter as { name: string } | Array<{ name: string }> | null)
  const area = unwrap(video.area as { name: string } | Array<{ name: string }> | null)

  return (
    <article className="break-inside-avoid glass-card overflow-hidden group">
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {playing ? (
          <iframe
            src={`${youTubeEmbedUrl(video.youtube_video_id)}?autoplay=1`}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading={eager ? 'eager' : 'lazy'}
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full cursor-pointer"
            aria-label={`Play video: ${video.title}`}
          >
            <Image
              src={youTubeThumbnail(video.youtube_video_id)}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <span className="absolute inset-0 bg-brand-navy/30 group-hover:bg-brand-navy/10 transition-colors" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full bg-brand-gold flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-brand-navy fill-brand-navy ml-0.5" />
              </span>
            </span>
            <span className="absolute bottom-2 right-2 bg-brand-navy/80 text-brand-white text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
              <Play className="w-3 h-3" /> YouTube
            </span>
          </button>
        )}
      </div>
      <div className="p-5">
        <h2 className="font-display text-lg font-bold text-brand-white group-hover:text-brand-gold transition-colors">{video.title}</h2>
        <div className="flex items-center gap-2 mt-2 text-xs text-brand-silver/60 flex-wrap">
          <span>{formatDate(video.created_at)}</span>
          {chapter && <span>&bull; {chapter.name} Chapter</span>}
          {area && <span>&bull; {area.name}</span>}
        </div>
        {video.content && (
          <p className="text-brand-silver/80 mt-3 text-sm line-clamp-3 leading-relaxed">{video.content}</p>
        )}
      </div>
    </article>
  )
}

export function VideoGrid({ videos }: { videos: VideoItem[] }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {videos.map((v, i) => (
        <VideoCard key={v.id} video={v} eager={i === 0} />
      ))}
    </div>
  )
}
