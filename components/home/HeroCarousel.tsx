'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroSlide } from '@/lib/types/database'

interface HeroCarouselProps {
  slides: HeroSlide[]
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const activeSlides = slides.filter(s => s.is_active)

  const goTo = useCallback((index: number) => {
    if (isTransitioning || index === current) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrent(index)
      setIsTransitioning(false)
    }, 300)
  }, [current, isTransitioning])

  const prev = useCallback(() => {
    goTo((current - 1 + activeSlides.length) % activeSlides.length)
  }, [current, activeSlides.length, goTo])

  const next = useCallback(() => {
    goTo((current + 1) % activeSlides.length)
  }, [current, activeSlides.length, goTo])

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (activeSlides.length <= 1) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [next, activeSlides.length])

  if (activeSlides.length === 0) {
    return (
      <div className="relative h-[60vh] min-h-[400px] bg-gradient-to-br from-brand-sapphire via-brand-navy to-brand-navy flex items-center justify-center">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #c9a84c 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative text-center px-4">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-white mb-4">
            Welcome to <span className="text-gradient-gold">UCCI</span>
          </h1>
          <p className="text-brand-silver text-xl max-w-2xl mx-auto">
            United Chamber of Commerce India — Elite Business Networking
          </p>
        </div>
      </div>
    )
  }

  const slide = activeSlides[current]

  return (
    <div className="relative h-[92vh] min-h-[500px] overflow-hidden group" aria-label="Hero image carousel" role="region">

      {/* Slide Image */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <Image
          src={slide.image_url.split('?')[0]}
          alt={slide.alt_text}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          unoptimized
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/80 via-brand-navy/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent" />
      </div>

      {/* Slide Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className={`max-w-2xl transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            {slide.title && (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-brand-white mb-4 leading-tight">
                {slide.title}
              </h1>
            )}
            {slide.subtitle && (
              <p className="text-brand-silver text-lg md:text-xl mb-8 leading-relaxed">
                {slide.subtitle}
              </p>
            )}
            {slide.cta_text && slide.cta_url && (
              <Link href={slide.cta_url} className="btn-primary text-base inline-flex items-center gap-2">
                {slide.cta_text}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-brand-sapphire/80 border border-brand-gold/30 flex items-center justify-center text-brand-white hover:bg-brand-gold hover:text-brand-navy transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-brand-sapphire/80 border border-brand-gold/30 flex items-center justify-center text-brand-white hover:bg-brand-gold hover:text-brand-navy transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2" role="tablist" aria-label="Slide indicators">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === current}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => goTo(idx)}
              className={`transition-all duration-300 rounded-full ${idx === current
                ? 'w-8 h-2 bg-brand-gold'
                : 'w-2 h-2 bg-brand-silver/50 hover:bg-brand-silver'
                }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
