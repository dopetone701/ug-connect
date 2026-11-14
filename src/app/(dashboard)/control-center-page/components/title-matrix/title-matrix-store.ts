"use client"
import { create } from "zustand"

export type TitleStyle = { color: string; gradientOn: boolean; gradientFrom: string; gradientTo: string; border: number; shadow: number; exposure: number }
export type TitleOverlayData = { text: string; font: string; on: boolean; style?: TitleStyle }

// --- THE ONLY D1 CONNECTION IN THE WHOLE APP ---
const WRITE_API = "https://movie-creation-portal-api.connectu89.workers.dev"
const READ_API = "https://movie-server-api.connectu89.workers.dev"

// FIX: D1 carries ON + TEXT + FONT + STYLE — tiny carrier, so faders reach users.
// D1 never carries whole system, just this one small object per movie.
async function saveToD1(movieId: string, data: TitleOverlayData) {
  try {
    await fetch(`${WRITE_API}/movies/${movieId}/title`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      cache: "no-store",
      body: JSON.stringify({ on: data.on, text: data.text || "", font: data.font || "cinzel", style: data.style || null }),
    })
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("ug-title-saved"))
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

  // FIX: pulls D1 on + text + font + style for all movies, merges into local.
  // This is how admin faders reach users: D1 carries style, store seeds local.
  // If D1 says false -> hide, but KEEP text/style so turning ON again keeps it.
  // If D1 says true + has text/style -> create local entry even if local was empty. No inventing.
  loadOverlays: async () => {
    try {
      const res = await fetch(`${READ_API}/title-overlays?t=${Date.now()}`, { cache: "no-store" })
      const data: any = await res.json()
      if (!data.overlays) return
      const cur = { ...get().overlays }
      for (const id of Object.keys(data.overlays)) {
        const raw = data.overlays[id]
        // Backwards compat: old D1 returns true/false only
        const on = raw === true ? true : raw === false ? false : !!raw?.on
        const d1Text = typeof raw === "object" ? (raw.text || "") : ""
        const d1Font = typeof raw === "object" ? (raw.font || "cinzel") : "cinzel"
        const d1Style = typeof raw === "object" ? (raw.style || null) : null
        if (!on) {
          if (cur[id]) cur[id] = { ...cur[id], on: false, text: d1Text || cur[id].text, font: d1Font || cur[id].font, style: d1Style || cur[id].style }
        } else {
          // D1 ON + D1 has text -> seed local, even on a new device. This is the fix.
          if (d1Text.trim()) {
            cur[id] = { text: d1Text, font: d1Font, on: true, style: d1Style || cur[id]?.style }
          } else if (cur[id]) {
            cur[id] = { ...cur[id], on: true }
          }
          // D1 ON but no text anywhere -> hide, don't invent movie title
        }
      }
      save(cur); set({ overlays: cur })
    } catch {}
  },

  setStyle: (movieId, style) => {
    const cur = get().overlays[movieId];
    // No overlay yet? Create a draft (on:false) so faders still preview + persist.
    // Add button later flips on:true and keeps this style.
    // FIX: style DOES go to D1 now — or user never sees fader move.
    const next: TitleOverlayData = { text: cur?.text || "", font: cur?.font || "cinzel", on: cur?.on || false, style };
    const overlays = { ...get().overlays, [movieId]: next };
    save(overlays); set({ overlays });
    saveToD1(movieId, next)
  },
  setOverlay: (movieId, text, font) => {
    const prev = get().overlays[movieId];
    const next: TitleOverlayData = { text, font, on: true, style: prev?.style }
    const overlays = { ...get().overlays, [movieId]: next }
    save(overlays); set({ overlays })
    saveToD1(movieId, next)
  },
  toggle: (movieId) => {
    const cur = get().overlays[movieId]
    if (!cur) return
    const nextOn = !cur.on
    // No fallback: can't turn ON without actual text
    if (nextOn && !cur.text?.trim()) return
    const next: TitleOverlayData = { ...cur, on: nextOn }
    const overlays = { ...get().overlays, [movieId]: next }
    save(overlays); set({ overlays })
    saveToD1(movieId, next)
  },
}))