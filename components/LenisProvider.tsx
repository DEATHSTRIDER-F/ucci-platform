'use client'

import { ReactNode, useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

declare global {
  interface Window {
    __lenis?: Lenis
  }
}

export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Only skip on phones/tablets (coarse pointer, no mouse).
    // NOTE: must NOT use maxTouchPoints/ontouchstart: touchscreen laptops report
    // touch support and were wrongly disabling smooth scroll on desktop.
    // NOTE: intentionally not gated on prefers-reduced-motion: most smooth-scroll
    // sites keep the effect regardless, and Lenis wheel easing is subtle.
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const fine = window.matchMedia('(pointer: fine)').matches
    if (coarse && !fine) return

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: false,
      gestureOrientation: 'vertical',
      anchors: true,
    })
    window.__lenis = lenis
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('%cLenis active: wheel smoothing on', 'color:#D4AF37')
    }

    // Manual raf loop (instead of the React wrapper): version-proof and avoids
    // remounting the tree when enabling.
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      window.__lenis = undefined
    }
  }, [])

  return <>{children}</>
}
