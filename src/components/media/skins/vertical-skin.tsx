// src/components/media/skins/vertical-skin.tsx
'use client'
import { useEngine } from '../engine/use-engine'
import type { SkinProps } from './skin-types'
import './skins.css'

export function VerticalSkin({ className = '' }: SkinProps) {
  const { current, playback, togglePlay } = useEngine()

  if (!current) return null

  return (
    <div className={`skin-wrapper skin-wrapper--vertical ${className}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100dvh', background: 'transparent', overflow: 'hidden', zIndex: 2, pointerEvents: 'none' }}>
      {/* NO <video> HERE - video lives in EngineProvider */}

      <div className="skin-controls skin-controls--vertical" style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        <div className="flex flex-col gap-1 text-white absolute bottom-20 left-3 right-20 pointer-events-auto">
          <p className="font-bold">@{current?.author || 'user'}</p>
          <p className="text-sm opacity-90">{current?.title}</p>
        </div>

        {playback !== 'playing' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" onClick={togglePlay} style={{ pointerEvents: 'auto' }}>
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl">▶</div>
          </div>
        )}
      </div>

      {/* full-screen tap to play/pause */}
      <div onClick={togglePlay} style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'auto' }} />
    </div>
  )
}
