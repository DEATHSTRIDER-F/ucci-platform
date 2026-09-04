'use client'

import { ReactLenis } from 'lenis/react'
import { ReactNode, useEffect, useState } from 'react'

export function LenisProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    // Disable smooth scroll on touch/low-power or reduced-motion — major mobile perf win
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setEnabled(!prefersReduced && !isTouch)
  }, [])
  if (!enabled) return <>{children}</>
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1, smoothWheel: true, gestureOrientation: 'vertical' }}>
      {children}
    </ReactLenis>
  )
}
