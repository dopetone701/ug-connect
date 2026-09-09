// src/components/media/desktop/desktop-shell.tsx
'use client'
import { StandardSkin } from '../skins/standard-skin'
import { useEngine } from '../engine/use-engine'
import { useEffect } from 'react'
import type { MediaSource } from '../engine/engine-types'
import './desktop.css'

export function DesktopShell({ source }: { source: MediaSource }) {
  const { play, current, setSkin, exitMini } = useEngine()

  useEffect(() => {
    setSkin('standard')
    exitMini()
    if (source && current?.id!== source.id) {
      play(source)
    }
  }, [source]) // eslint-disable-line

  return (
    <div className="desktop-shell">
      <StandardSkin />
    </div>
  )
}
