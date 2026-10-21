"use client"
import { create } from "zustand"

type SheetState = {
  isOpen: boolean
  activeId: string | null
  detail: any
  open: (id: string, detail?: any) => void
  close: () => void
}

export const useFooterSheet = create<SheetState>((set) => ({
  isOpen: false,
  activeId: null,
  detail: null,
  open: (id, detail) => set({ isOpen: true, activeId: id, detail }),
  close: () => set({ isOpen: false, activeId: null, detail: null }),
}))

