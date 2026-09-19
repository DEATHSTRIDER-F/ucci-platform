'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, LayoutGrid, Play } from 'lucide-react'
import { formatDate } from '@/lib/utils/utils'
import { youTubeThumbnail, youTubeEmbedUrl } from '@/lib/utils/youtube'

export interface GalleryPost {
  id: string
  title: string
  content: string | null
  created_at: string
  youtube_video_id?: string | null
  images: Array<{
    id: string
    image_url: string
    alt_text: string
    display_order: number
  }>
  area?: { name: string } | null
  chapter?: { name: string } | null
}

export function MasonryGallery({ posts }: { posts: GalleryPost[] }) {
  const [selectedPost, setSelectedPost] = useState<GalleryPost | null>(null)
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  // 'video' shows the YouTube embed; a number shows that image index
  const [mediaView, setMediaView] = useState<'video' | number>('video')

  const openModal = (post: GalleryPost) => {
    setSelectedPost(post)
    setCurrentImageIdx(0)
    setMediaView(post.youtube_video_id ? 'video' : 0)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setSelectedPost(null)
    setCurrentImageIdx(0)
    setMediaView('video')
    document.body.style.overflow = 'auto'
  }

  const goToImage = useCallback((idx: number) => {
    setCurrentImageIdx(idx)
    setMediaView(idx)
  }, [])

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!selectedPost) return
    const images = [...(selectedPost.images || [])].sort((a, b) => a.display_order - b.display_order)
    const next = (currentImageIdx + 1) % images.length
    setCurrentImageIdx(next)
    setMediaView(next)
  }, [selectedPost, currentImageIdx])

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!selectedPost) return
    const images = [...(selectedPost.images || [])].sort((a, b) => a.display_order - b.display_order)
    const prev = (currentImageIdx - 1 + images.length) % images.length
    setCurrentImageIdx(prev)
    setMediaView(prev)
  }, [selectedPost, currentImageIdx])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPost) return
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPost, nextImage, prevImage])

  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe) {
      nextImage()
    } else if (isRightSwipe) {
      prevImage()
    }
  }

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {posts.map((post) => {
          const images = [...(post.images || [])].sort((a, b) => a.display_order - b.display_order)
          const primaryImage = images[0]
          const hasVideo = !!post.youtube_video_id
          const chapter = Array.isArray(post.chapter) ? post.chapter[0] : post.chapter
          const area = Array.isArray(post.area) ? post.area[0] : post.area

          return (
            <article 
              key={post.id} 
              className="break-inside-avoid glass-card overflow-hidden cursor-pointer group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-gold/10"
              onClick={() => openModal(post)}
            >
              {hasVideo ? (
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <Image
                    src={youTubeThumbnail(post.youtube_video_id!)}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-brand-navy fill-brand-navy ml-0.5" />
                    </span>
                  </span>
                  {images.length > 0 && (
                    <div className="absolute top-3 right-3 bg-brand-navy/80 backdrop-blur-sm text-brand-gold px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                      <LayoutGrid className="w-3 h-3" />
                      <span>{images.length}</span>
                    </div>
                  )}
                </div>
              ) : primaryImage ? (
                <div className="relative aspect-video w-full overflow-hidden bg-brand-navy/50">
                  <Image
                    src={primaryImage.image_url}
                    alt={primaryImage.alt_text || post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {images.length > 1 && (
                    <div className="absolute top-3 right-3 bg-brand-navy/80 backdrop-blur-sm text-brand-gold px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                      <LayoutGrid className="w-3 h-3" />
                      <span>{images.length}</span>
                    </div>
                  )}
                </div>
              ) : null}
              <div className="p-5">
                <h2 className="font-display text-lg font-bold text-brand-white group-hover:text-brand-gold transition-colors">{post.title}</h2>
                <div className="flex items-center gap-2 mt-2 text-xs text-brand-silver/60 flex-wrap">
                  <span>{formatDate(post.created_at)}</span>
                  {chapter && <span>&bull; {(chapter as { name: string }).name} Chapter</span>}
                  {area && <span>&bull; {(area as { name: string }).name}</span>}
                </div>
                {post.content && (
                  <p className="text-brand-silver/80 mt-3 text-sm line-clamp-3 leading-relaxed">{post.content}</p>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/95 backdrop-blur-md transition-opacity duration-300 p-2 sm:p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full h-full max-h-[100dvh] max-w-7xl mx-auto flex flex-col justify-center overflow-hidden rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex justify-between items-start gap-3 z-10 bg-gradient-to-b from-brand-navy/80 to-transparent">
              <div className="text-brand-white max-w-2xl min-w-0">
                <h3 className="text-base sm:text-xl font-display font-bold break-words">{selectedPost.title}</h3>
                {selectedPost.content && (
                  <p className="text-xs sm:text-sm text-brand-silver mt-1 line-clamp-2">{selectedPost.content}</p>
                )}
              </div>
              <button 
                onClick={closeModal}
                className="p-2 text-brand-silver hover:text-brand-white bg-brand-navy/50 hover:bg-brand-gold/20 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Image Area */}
            <div 
              className="relative flex-1 flex items-center justify-center p-4 sm:p-12 overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {(() => {
                const images = [...(selectedPost.images || [])].sort((a, b) => a.display_order - b.display_order)
                if (mediaView === 'video' && selectedPost.youtube_video_id) {
                  return (
                    <div className="relative w-full max-w-5xl aspect-video">
                      <iframe
                        src={youTubeEmbedUrl(selectedPost.youtube_video_id) + '?autoplay=1'}
                        title={selectedPost.title}
                        className="absolute inset-0 w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )
                }
                if (images.length === 0) return null
                const currentImg = images[currentImageIdx]

                return (
                  <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
                    <Image
                      src={currentImg.image_url}
                      alt={currentImg.alt_text || selectedPost.title}
                      fill
                      className="object-contain transition-opacity duration-300"
                      sizes="100vw"
                    />
                  </div>
                )
              })()}

              {/* Arrows (images only) */}
              {mediaView !== 'video' && selectedPost.images && selectedPost.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-brand-navy/50 text-brand-white hover:bg-brand-gold hover:text-brand-navy backdrop-blur-sm border border-brand-white/10 transition-all z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-brand-navy/50 text-brand-white hover:bg-brand-gold hover:text-brand-navy backdrop-blur-sm border border-brand-white/10 transition-all z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {(selectedPost.youtube_video_id || (selectedPost.images && selectedPost.images.length > 1)) && (
              <div className="h-24 p-4 bg-gradient-to-t from-brand-navy to-transparent flex items-center justify-center gap-2 overflow-x-auto">
                {selectedPost.youtube_video_id && (
                  <button
                    onClick={() => setMediaView('video')}
                    className={'relative flex-shrink-0 h-16 w-24 rounded-md overflow-hidden transition-all duration-200 ' + (mediaView === 'video'
                      ? 'ring-2 ring-brand-gold ring-offset-2 ring-offset-brand-navy scale-105'
                      : 'opacity-50 hover:opacity-100')}
                  >
                    <img
                      src={youTubeThumbnail(selectedPost.youtube_video_id)}
                      alt="Video thumbnail"
                      className="object-cover w-full h-full"
                    />
                  </button>
                )}
                {(() => {
                  const images = [...selectedPost.images].sort((a, b) => a.display_order - b.display_order)
                  return images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => goToImage(idx)}
                      className={`relative flex-shrink-0 h-16 w-24 rounded-md overflow-hidden transition-all duration-200 ${
                        mediaView !== 'video' && idx === currentImageIdx
                          ? 'ring-2 ring-brand-gold ring-offset-2 ring-offset-brand-navy scale-105'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img.image_url}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </button>
                  ))
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
