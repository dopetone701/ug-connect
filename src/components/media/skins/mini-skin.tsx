// src/components/media/skins/mini-skin.tsx
'use client'
import { useEngine } from '../engine/use-engine'
import { useSkinViewport } from './skin-controller'
import './skins.css'

export function MiniSkin() {
  const { current, togglePlay, exitMini, playback, videoRef, activeSkin, isMini } = useEngine()
  useSkinViewport(videoRef, 'mini', activeSkin, isMini)

  return (
    <div className="skin-wrapper skin-wrapper--mini">
      <div className="skin-viewport" id="skin-viewport-mini" />
      <div className="absolute inset-0 p-2 flex flex-col justify-between pointer-events-none">
        <div className="flex justify-between pointer-events-auto">
          <button onClick={exitMini} className="w-6 h-6 rounded-full bg-black/60 text-white text-xs">✕</button>
        </div>
        <button onClick={togglePlay} className="self-start bg-black/60 text-white px-2 py-1 rounded text-xs pointer-events-auto">
          {playback === 'playing'? 'Pause' : 'Play'} • {current?.title?.slice(0,20)}
        </button>
      </div>
    </div>
  )
}
