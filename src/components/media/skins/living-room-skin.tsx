// src/components/media/skins/living-room-skin.tsx
'use client'
import { useEngine } from '../engine/use-engine'
import { useSkinViewport } from './skin-controller'
import type { SkinProps } from './skin-types'
import './skins.css'

export function LivingRoomSkin({ className = '' }: SkinProps) {
  const { current, togglePlay, seek, currentTime, duration, videoRef, activeSkin, isMini } = useEngine()

  // teleport the ONE video into this skin
  useSkinViewport(videoRef, 'living-room', activeSkin, isMini)

  if (!current) {
    return (
      <div className={`skin-wrapper skin-wrapper--living-room ${className} bg-black flex items-center justify-center`}>
        <p className="text-white text-xl">No media loaded on TV</p>
      </div>
    )
  }

  return (
    <div className={`skin-wrapper skin-wrapper--living-room ${className}`}>
      {/* the real video from core-engine lands here */}
      <div 
        className="skin-viewport" 
        id="skin-viewport-tv" 
        tabIndex={0}
      />

      {/* TV overlay controls - focusable for remote */}
      <div className="skin-controls">
        <h2 className="text-3xl text-white font-bold tracking-wide drop-shadow">
          {current.title}
        </h2>
        {current.author && (
          <p className="text-white/70 text-lg mt-2">@{current.author}</p>
        )}

        <div className="flex gap-6 mt-8">
          <button
            tabIndex={0}
            autoFocus
            onClick={togglePlay}
            className="px-10 py-5 bg-white text-black text-xl font-bold rounded-xl focus:ring-4 focus:ring-yellow-400 focus:outline-none transition"
          >
            ⏯ Play / Pause (OK)
          </button>
          <button
            tabIndex={0}
            onClick={() => seek(currentTime - 10)}
            className="px-8 py-5 bg-white/20 backdrop-blur text-white text-xl rounded-xl focus:ring-4 focus:ring-white focus:outline-none transition"
          >
            ⏪ -10s (Left)
          </button>
          <button
            tabIndex={0}
            onClick={() => seek(currentTime + 10)}
            className="px-8 py-5 bg-white/20 backdrop-blur text-white text-xl rounded-xl focus:ring-4 focus:ring-white focus:outline-none transition"
          >
            +10s (Right) ⏩
          </button>
        </div>

        {/* progress bar TV style */}
        <div className="mt-8 w-full max-w-3xl">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${duration? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-white/60 text-sm mt-2">
            <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
            <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
