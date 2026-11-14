"use client"
import { create } from "zustand"

export type TitleStyle = { color: string; gradientOn: boolean; gradientFrom: string; gradientTo: string; border: number; shadow: number; exposure: number }
export type TitleOverlayData = { text: string; font: string; on: boolean; style?: TitleStyle }

const WRITE_API = "https://movie-creation-portal-api.connectu89.workers.dev"
const READ_API = "https://movie-server-api.connectu89.workers.dev"
const SAVE_DELAY = 400

export const DEFAULT_STYLE: TitleStyle = { color: "#ffffff", gradientOn: false, gradientFrom: "#ffffff", gradientTo: "#ff0080", border: 2, shadow: 18, exposure: 100 }

// ---- D1 IS THE ONLY SOURCE. No localStorage at all. ----
// Titles live on the movie's own D1 row, so they are locked to the movie id.
const timers = new Map<string, ReturnType<typeof setTimeout>>() // debounced saves waiting
const dirty = new Set<string>() // movies with unsaved/in-flight edits: a refresh must not overwrite these
let loadingPromise: Promise<void> | null = null
let lastLoad = 0
let started = false

async function postToD1(movieId: string, d: TitleOverlayData): Promise<boolean> {
  try {
    const res = await fetch(`${WRITE_API}/movies/${encodeURIComponent(movieId)}/title`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ on: d.on, text: d.text, font: d.font, style: d.style }),
    })
    if (!res.ok) console.warn("[title-matrix] save failed", res.status, await res.text().catch(() => ""))
    return res.ok
  } catch (e) {
    console.warn("[title-matrix] save error", e)
    return false
  }
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
  ready: boolean // true once D1 has answered at least once
  saveError: string | null
  loadOverlays: (force?: boolean) => Promise<void>
  setOverlay: (movieId: string, patch: Partial<Pick<TitleOverlayData, "text" | "font" | "on">>) => void
  setStyle: (movieId: string, patch: Partial<TitleStyle>) => void
  toggle: (movieId: string) => void
}

export const useTitleMatrixStore = create<PanelState>()((set, get) => {
  function apply(movieId: string, build: (cur: TitleOverlayData | undefined) => TitleOverlayData | null, immediate = false) {
    const next = build(get().overlays[movieId])
    if (!next) return
    set({ overlays: { ...get().overlays, [movieId]: next } })
    queueSave(movieId, immediate ? 0 : SAVE_DELAY)
  }

  function queueSave(movieId: string, delay: number) {
    dirty.add(movieId)
    const old = timers.get(movieId)
    if (old) clearTimeout(old)
    timers.set(movieId, setTimeout(async () => {
      timers.delete(movieId)
      const d = get().overlays[movieId]
      if (!d) { dirty.delete(movieId); return }
      const ok = await postToD1(movieId, d)
      if (timers.has(movieId)) return // a newer edit is queued, it will save the latest
      dirty.delete(movieId)
      if (ok) {
        if (get().saveError) set({ saveError: null })
      } else {
        set({ saveError: "Save failed — change was not applied for users. Rolled back." })
        void get().loadOverlays(true)
      }
    }, delay))
  }

  return {
    isOpen: false,
    selectedId: null,
    view: "all",
    openPanel: (id) => set({ isOpen: true, selectedId: id ?? null, view: id ? "movie" : "all" }),
    closePanel: () => set({ isOpen: false }),
    togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
    select: (id) => set({ selectedId: id, view: id ? "movie" : "all" }),
    backToAll: () => set({ view: "all", selectedId: null }),

    overlays: {},
    ready: false,
    saveError: null,

    loadOverlays: async (force = false) => {
      if (loadingPromise) return loadingPromise
      if (!force && Date.now() - lastLoad < 2000) return
      loadingPromise = (async () => {
        try {
          const res = await fetch(`${READ_API}/title-overlays?t=${Date.now()}`, { cache: "no-store" })
          if (!res.ok) { console.warn("[title-matrix] load failed", res.status); return }
          const data: any = await res.json()
          if (!data?.overlays) { console.warn("[title-matrix] no overlays in response", data); return }
          const cur = get().overlays
          const next: Record<string, TitleOverlayData> = {}
          for (const id of Object.keys(data.overlays)) {
            if (dirty.has(id) && cur[id]) { next[id] = cur[id]; continue } // don't clobber an edit in progress
            const raw = data.overlays[id]
            const on = raw === true || raw?.on === true
            const text = typeof raw?.text === "string" ? raw.text : ""
            const font = (typeof raw?.font === "string" && raw.font) || "cinzel"
            const style = raw?.style && typeof raw.style === "object" ? { ...DEFAULT_STYLE, ...raw.style } : undefined
            if (!on && !text.trim() && !style) continue
            next[id] = { on, text, font, style }
          }
          for (const id of dirty) if (cur[id] && !next[id]) next[id] = cur[id]
          set({ overlays: next, ready: true })
        } catch (e) {
          console.warn("[title-matrix] load error", e)
        } finally {
          loadingPromise = null
          lastLoad = Date.now()
        }
      })()
      return loadingPromise
    },

    setStyle: (movieId, patch) =>
      apply(movieId, (cur) => ({
        text: cur?.text || "",
        font: cur?.font || "cinzel",
        on: cur?.on || false,
        style: { ...DEFAULT_STYLE, ...(cur?.style || {}), ...patch },
      })),

    setOverlay: (movieId, patch) =>
      apply(movieId, (cur) => ({
        text: patch.text !== undefined ? patch.text : cur?.text || "",
        font: patch.font !== undefined ? patch.font : cur?.font || "cinzel",
        on: patch.on !== undefined ? patch.on : cur?.on || false,
        style: cur?.style,
      }), patch.on !== undefined),

    toggle: (movieId) =>
      apply(movieId, (cur) => {
        if (!cur) return null
        const nextOn = !cur.on
        if (nextOn && !cur.text?.trim()) return null
        return { ...cur, on: nextOn }
      }, true),
  }
})

// Idempotent. Loads from D1 on app open, and again when the app returns to the foreground.
export function startTitleSync() {
  if (started || typeof window === "undefined") return
  started = true
  try { localStorage.removeItem("title-matrix-overlays") } catch {} // purge the old cache for good
  void useTitleMatrixStore.getState().loadOverlays(true)
  const refresh = () => { if (document.visibilityState === "visible") void useTitleMatrixStore.getState().loadOverlays() }
  document.addEventListener("visibilitychange", refresh)
  window.addEventListener("focus", refresh)
}

