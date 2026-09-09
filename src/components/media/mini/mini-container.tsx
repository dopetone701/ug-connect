// src/components/media/mini/mini-container.tsx
'use client'
import { useEngine } from '../engine/use-engine'
import { MiniSkin } from '../skins/mini-skin'

export function MiniContainer() {
  const { isMini, current } = useEngine()
  if (!isMini || !current) return null
  return (
    <div className="mini-container-fixed">
      <MiniSkin />
    </div>
  )
}
