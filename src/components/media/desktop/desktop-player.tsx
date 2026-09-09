// src/components/media/desktop/desktop-player.tsx
'use client'
import { DesktopShell } from './desktop-shell'
import type { MediaSource } from '../engine/engine-types'

export function DesktopPlayer({ source }: { source: MediaSource }) {
  return <DesktopShell source={source} />
}
