// src/components/media/engine/engine-controller.ts
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useEngine } from './use-engine'

export function useEngineController() {
  const { isMini, current, enterMini, activeSkin } = useEngine()
  const pathname = usePathname()

  // auto-enter mini when user leaves watch page while playing
  useEffect(() => {
    const isWatchPage = pathname?.includes('/movies/watch') || pathname?.includes('/reels') || pathname?.includes('/hair-cuts')
    const isPlaying = current &&!isWatchPage

    // only if video exists and we are not on watch page
    if (current &&!isWatchPage && activeSkin!== 'mini' &&!isMini) {
      // small delay so navigation finishes first
      const t = setTimeout(() => enterMini(), 150)
      return () => clearTimeout(t)
    }
  }, [pathname, current, activeSkin, isMini, enterMini])

  return null
}
