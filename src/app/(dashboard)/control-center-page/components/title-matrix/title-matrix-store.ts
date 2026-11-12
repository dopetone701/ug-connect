"use client"
import { create } from "zustand"

export type TitleStyle = { color: string; gradientOn: boolean; gradientFrom: string; gradientTo: string; border: number; shadow: number; exposure: number }
export type TitleOverlayData = { text: string; font: string; on: boolean; style?: TitleStyle }

type PanelState = {
  isOpen: boolean
  selectedId: string | null
  view: "all" | "movie"
  openPanel: (id?: string | null) => void
  closePanel: () => void
  togglePanel: () => void
  select: (id: string | null) => void
  backToAll: () => void
  overlays: Record<string, TitleOverlayData>
  setOverlay: (movieId: string, text: string, font: string) => void
  setStyle: (movieId: string, style: TitleStyle) => void
  toggle: (movieId: string) => void
}

function load(): Record<string, TitleOverlayData> {
  try { return JSON.parse(localStorage.getItem("title-matrix-overlays") || "{}") } catch { return {} }
}
function save(o: Record<string, TitleOverlayData>) { try { localStorage.setItem("title-matrix-overlays", JSON.stringify(o)) } catch {} }

export const useTitleMatrixStore = create<PanelState>()((set, get) => ({
  isOpen: false,
  selectedId: null,
  view: "all",
  openPanel: (id) => set({ isOpen: true, selectedId: id ?? null, view: id ? "movie" : "all" }),
  closePanel: () => set({ isOpen: false }),
  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
  select: (id) => set({ selectedId: id, view: id ? "movie" : "all" }),
  backToAll: () => set({ view: "all", selectedId: null }),
  overlays: typeof window === "undefined" ? {} : load(),
  setStyle: (movieId, style) => {
    const cur = get().overlays[movieId];
    // No overlay yet? Create a draft (on:false) so faders still preview + persist.
    // Add button later flips on:true and keeps this style.
    const overlays = { ...get().overlays, [movieId]: { text: cur?.text || "", font: cur?.font || "cinzel", on: cur?.on || false, style } };
    save(overlays); set({ overlays });
  },
  setOverlay: (movieId, text, font) => {
    const prev = get().overlays[movieId];
    const overlays = { ...get().overlays, [movieId]: { text, font, on: true, style: prev?.style } }
    save(overlays); set({ overlays })
  },
  toggle: (movieId) => {
    const cur = get().overlays[movieId]
    if (!cur) return
    const overlays = { ...get().overlays, [movieId]: { ...cur, on: !cur.on } }
    save(overlays); set({ overlays })
  },
}))

