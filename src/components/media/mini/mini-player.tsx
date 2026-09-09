// src/components/media/mini/mini-player.tsx
'use client'
import { useEngine } from '../engine/use-engine'
import { MiniSkin } from '../skins/mini-skin'

export function MiniPlayer() {
  const { isMini, current, exitMini } = useEngine()
  if (!current) return null

  // if not in mini state, this component does nothing
  // CoreEngine is still alive
  if (!isMini) return null

  return (
    <div className="mini-player" onClick={exitMini}>
      <MiniSkin />
    </div>
  )
}
