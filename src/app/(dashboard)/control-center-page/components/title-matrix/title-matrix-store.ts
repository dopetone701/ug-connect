"use client"
import { create } from "zustand"

export type TitleStyle = { color: string; gradientOn: boolean; gradientFrom: string; gradientTo: string; border: number; shadow: number; exposure: number }
export type TitleOverlayData = { text: string; font: string; on: boolean; style?: TitleStyle }

// --- THE ONLY D1 CONNECTION IN THE WHOLE APP ---
const WRITE_API = "https://movie-creation-portal-api.connectu89.workers.dev"
const READ_API = "https://movie-server-api.connectu89.workers.dev"

// ONLY true/false goes to D1. Never text/font/style.
async function saveToD1(movieId: string, on: boolean) {
  try {
    await fetch(`${WRITE_API}/movies/${movieId}/title`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      cache: "no-store",
      body: JSON.stringify({ on }),
    })
  } catch {}
}

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
  loadOverlays: () => Promise<void>
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

  // TRIGGER: pulls D1 true/false for all movies, applies to local overlays.
  // If D1 says false -> hide. If D1 says true but no local -> hide (no fallback).
  loadOverlays: async () => {
    try {
      const res = await fetch(`${READ_API}/title-overlays?t=${Date.now()}`, { cache: "no-store" })
      const data: any = await res.json()
      if (!data.overlays) return
      const cur = { ...get().overlays }
      for (const id of Object.keys(data.overlays)) {
        const on = data.overlays[id] === true
        if (!on) {
          if (cur[id]) cur[id] = { ...cur[id], on: false }
        } else {
          if (cur[id]) cur[id] = { ...cur[id], on: true }
          // No local entry = don't invent one. Overlay stays hidden until admin sets it locally.
        }
      }
      save(cur); set({ overlays: cur })
    } catch {}
  },

  setStyle: (movieId, style) => {
    const cur = get().overlays[movieId];
    // No overlay yet? Create a draft (on:false) so faders still preview + persist.
    // Add button later flips on:true and keeps this style.
    // LOCAL ONLY — no D1 call here, style never leaves browser.
    const overlays = { ...get().overlays, [movieId]: { text: cur?.text || "", font: cur?.font || "cinzel", on: cur?.on || false, style } };
    save(overlays); set({ overlays });
  },
  setOverlay: (movieId, text, font) => {
    const prev = get().overlays[movieId];
    const overlays = { ...get().overlays, [movieId]: { text, font, on: true, style: prev?.style } }
    save(overlays); set({ overlays })
    saveToD1(movieId, true) // <-- ONLY true goes to D1
  },
  toggle: (movieId) => {
    const cur = get().overlays[movieId]
    if (!cur) return
    const next = !cur.on
    // No fallback: can't turn ON without actual text
    if (next && !cur.text?.trim()) return
    const overlays = { ...get().overlays, [movieId]: { ...cur, on: next } }
    save(overlays); set({ overlays })
    saveToD1(movieId, next) // <-- ONLY true/false goes to D1
  },
}))
