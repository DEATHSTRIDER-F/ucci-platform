'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselImage {
  id: string
  image_url: string
  alt_text: string
  display_order: number
}

interface ImageCarouselProps {
  images: CarouselImage[]
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() => setCurrent(c => (c - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setCurrent(c => (c + 1) % images.length), [images.length])

  if (images.length === 0) return null

  return (
    <div className="relative aspect-video bg-brand-navy group overflow-hidden" role="region" aria-label="Image gallery">
      {/* Main Image */}
      <Image
        src={images[current].image_url}
        alt={images[current].alt_text}
        fill
        className="object-cover transition-opacity duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        unoptimized
      />

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-brand-navy/70 border border-brand-gold/30 flex items-center justify-center text-brand-white hover:bg-brand-gold hover:text-brand-navy transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-brand-navy/70 border border-brand-gold/30 flex items-center justify-center text-brand-white hover:bg-brand-gold hover:text-brand-navy transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-3 right-3 bg-brand-navy/70 text-brand-silver text-xs px-2 py-1 rounded-full">
            {current + 1} / {images.length}
          </div>

          {/* Thumbnail strip */}
          <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-2 bg-gradient-to-t from-brand-navy/80 to-transparent justify-center">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrent(idx)}
                aria-label={`View image ${idx + 1}: ${img.alt_text}`}
                className={`relative w-12 h-8 rounded overflow-hidden border transition-all ${
                  idx === current ? 'border-brand-gold' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={img.image_url} alt={img.alt_text} fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
