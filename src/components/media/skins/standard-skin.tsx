// src/components/media/skins/standard-skin.tsx
'use client'
import { useEngine } from '../engine/use-engine'
import type { SkinProps } from './skin-types'
import './skins.css'

export function StandardSkin({ className = '' }: SkinProps) {
  const { current, playback, currentTime, duration, togglePlay, seek, videoRef } = useEngine()

  if (!current) return <div className={`skin-wrapper skin-wrapper--standard ${className}`}>No media</div>

  return (
    <div className={`skin-wrapper skin-wrapper--standard ${className}`} style={{ position: 'relative', width: '100%', height: '100dvh', background: '#000' }}>
      {/* VIDEO IS HERE NOW - NOT TELEPORTED */}
      <video
        ref={videoRef}
        playsInline
        preload="auto"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
      />
      
      <div className="skin-controls" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: 16 }}>
        <div className="flex items-center gap-3 text-white">
          <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
            {playback === 'playing'? '❚❚' : '▶'}
          </button>
          <span className="text-sm">{Math.floor(currentTime)}s / {Math.floor(duration)}s</span>
          <input type="range" min={0} max={duration || 100} value={currentTime} onChange={e => seek(Number(e.target.value))} className="flex-1" />
        </div>
        <h3 className="text-white font-semibold mt-2">{current.title}</h3>
      </div>
    </div>
  )
}
