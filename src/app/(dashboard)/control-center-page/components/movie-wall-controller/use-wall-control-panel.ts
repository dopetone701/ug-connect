"use client"
import { create } from "zustand"
type PanelState = {
  isOpen: boolean
  selectedBattleKey: string | null
  view: "battles" | "chop"
  openPanel: (battleKey?: string | null) => void
  closePanel: () => void
  togglePanel: () => void
  selectBattle: (key: string) => void
  backToBattles: () => void
}
export const useWallControlPanel = create<PanelState>()((set) => ({
  isOpen: false,
  selectedBattleKey: null,
  view: "battles",
  openPanel: (battleKey) => set({ isOpen: true, selectedBattleKey: battleKey ?? null, view: battleKey ? "chop" : "battles" }),
  closePanel: () => set({ isOpen: false }),
  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
  selectBattle: (key) => set({ selectedBattleKey: key, view: "chop" }),
  backToBattles: () => set({ view: "battles" }),
}))

