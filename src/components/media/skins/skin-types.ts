// src/components/media/skins/skin-types.ts
import type { MediaSource } from '../engine/engine-types'

export type SkinProps = {
  source?: MediaSource
  className?: string
  autoPlay?: boolean
  onEnded?: () => void
  onNext?: () => void
}
