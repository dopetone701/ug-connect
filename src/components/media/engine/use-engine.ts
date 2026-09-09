// src/components/media/engine/use-engine.ts
'use client'

import { useContext } from 'react'
import { EngineContext } from './engine-provider'

export function useEngine() {
  const ctx = useContext(EngineContext)
  if (!ctx) {
    throw new Error('useEngine must be used inside EngineProvider. Wrap your layout with <EngineProvider>')
  }
  return ctx
}
