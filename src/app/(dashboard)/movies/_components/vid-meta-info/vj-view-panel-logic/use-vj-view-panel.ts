"use client"
import { create } from "zustand"

export type VJForPanel = {
  vjId?: string | null
  name: string
  slogan?: string | null
  // optional: pass from movie row if you have it later
  photo?: string | null
}

type VJViewPanelState = {
  isOpen: boolean
  vjId: string | null
  vj: VJForPanel | null
  open: (vj: VJForPanel) => void
  close: () => void
}

export const useVJViewPanel = create<VJViewPanelState>((set) => ({
  isOpen: false,
  vjId: null,
  vj: null,
  open: (vj) => set({
    isOpen: true,
    vjId: vj.vjId || vj.name,
    vj,
  }),
  close: () => set({ isOpen: false, vjId: null, vj: null }),
}))

// Slogans — add your real VJs here. Fallback is used if not listed.
export const VJ_SLOGANS: Record<string, string> = {
  "vj junior": "The Voice That Brings Hollywood Home.",
  "vj jingo": "Every Scene, In Your Language.",
  "vj emmy": "Where Stories Become Ours.",
  "vj ice p": "The Original Voice Of The Ghetto.",
  "vj eddy": "Laughter First, Story Always.",
}

export function sloganForVJ(name: string, custom?: string | null) {
  if (custom) return custom
  const key = String(name || "").trim().toLowerCase()
  return VJ_SLOGANS[key] || "The Voice That Brings Hollywood Home."
}

