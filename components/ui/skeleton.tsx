'use client'

import { cn } from '@/lib/utils/utils'

/**
 * Global reusable loading skeletons with a natural glare sweep.
 * Base color blends with brand navy/sapphire surfaces; the sweep is a
 * soft white/champagne highlight (see `.skeleton-glare` in globals.css).
 * Respects `prefers-reduced-motion` (glare disabled, static placeholder).
 */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('relative overflow-hidden bg-brand-sapphire/70 rounded-lg', className)}>
      <div className="skeleton-glare absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-white/15 to-transparent blur-[1px]" />
    </div>
  )
}

export function SkeletonText({ lines = 2, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3" />
      ))}
    </div>
  )
}

/** Image-shaped shimmer shown behind Next.js Images until they load. */
export function ImageSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('absolute inset-0 rounded-none', className)} />
}

/** Gallery/masonry card placeholder mirroring the real card layout. */
export function GalleryCardSkeleton() {
  return (
    <div aria-hidden className="break-inside-avoid glass-card overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-5 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2 opacity-70" />
        <Skeleton className="h-3 w-full opacity-50" />
      </div>
    </div>
  )
}

/** Grid of card skeletons for gallery-style loading states. */
export function GalleryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <GalleryCardSkeleton key={i} />
      ))}
    </div>
  )
}

/** Generic admin table/list placeholder. */
export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-hidden className="glass-card p-6 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full opacity-60" />
      ))}
    </div>
  )
}
