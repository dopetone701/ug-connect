"use client"
import { create } from "zustand"

type SheetItem = {
  id: string
  detail?: any
}

type SheetState = {
  stack: SheetItem[]
  isOpen: boolean
  activeId: string | null
  detail: any
  open: (id: string, detail?: any) => void
  close: () => void
  pop: () => void
}

export const useFooterSheet = create<SheetState>((set, get) => ({
  stack: [],
  isOpen: false,
  activeId: null,
  detail: null,
  open: (id, detail) => {
    const item = { id, detail }
    const newStack = [...get().stack, item]
    set({ 
      stack: newStack,
      isOpen: true,
      activeId: id,
      detail: detail || null
    })
    // Notify top bar
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ug-info-title", { detail: id }))
    }
  },
  close: () => {
    set({ stack: [], isOpen: false, activeId: null, detail: null })
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ug-info-title", { detail: "" }))
    }
  },
  pop: () => {
    const stack = get().stack
    if (stack.length <= 1) {
      set({ stack: [], isOpen: false, activeId: null, detail: null })
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ug-info-title", { detail: "" }))
      }
    } else {
      const newStack = stack.slice(0, -1)
      const top = newStack[newStack.length - 1]
      set({ stack: newStack, activeId: top.id, detail: top.detail })
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ug-info-title", { detail: top.id }))
      }
    }
  }
}))

