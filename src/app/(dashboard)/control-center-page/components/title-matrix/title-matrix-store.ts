"use client"
import { create } from "zustand"

export type TitleStyle = { color: string; gradientOn: boolean; gradientFrom: string; gradientTo: string; border: number; shadow: number; exposure: number }
export type TitleOverlayData = { text: string; font: string; on: boolean; style?: TitleStyle }

const WRITE_API = "https://movie-creation-portal-api.connectu89.workers.dev"
const READ_API = "https://movie-server-api.connectu89.workers.dev"
const CACHE_KEY = "title-matrix-overlays"
const SAVE_DELAY = 400

export const DEFAULT_STYLE: TitleStyle = { color: "#ffffff", gradientOn: false, gradientFrom: "#ffffff", gradientTo: "#ff0080", border: 2, shadow: 18, exposure: 100 }

// ---- module-level bookkeeping (shared by every card, so there is only ONE sync) ----
const timers = new Map<string, ReturnType<typeof setTimeout>>() // debounced saves waiting
const dirty = new Set<string>() // movies with unsaved/in-flight edits: refresh must not overwrite these
let loadingPromise: Promise<void> | null = null
let lastLoad = 0
let started = false

function readCache(): Record<string, TitleOverlayData> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") } catch { return {} }
}
function writeCache(o: Record<string, TitleOverlayData>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(o)) } catch {}
}

async function postToD1(movieId: string, d: TitleOverlayData): Promise<boolean> {
  try {
    const res = await fetch(`${WRITE_API}/movies/${encodeURIComponent(movieId)}/title`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // no Cache-Control header: it breaks CORS preflight
      cache: "no-store",
      body: JSON.stringify({ on: d.on, text: d.text, font: d.font, style: d.style }), // undefined style is omitted -> server keeps old
    })
    return res.ok
  } catch {
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
  saveError: string | null
  loadOverlays: (force?: boolean) => Promise<void>
  setOverlay: (movieId: string, patch: Partial<Pick<TitleOverlayData, "text" | "font" | "on">>) => void
  setStyle: (movieId: string, patch: Partial<TitleStyle>) => void
  toggle: (movieId: string) => void
}

export const useTitleMatrixStore = create<PanelState>()((set, get) => {
  // Update one movie locally (instant UI), then queue ONE debounced save to D1.
  function apply(movieId: string, build: (cur: TitleOverlayData | undefined) => TitleOverlayData | null, immediate = false) {
    const next = build(get().overlays[movieId])
    if (!next) return
    const overlays = { ...get().overlays, [movieId]: next }
    writeCache(overlays)
    set({ overlays })
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
        // Roll back to what D1 really has, and tell the admin
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

    overlays: {}, // filled from cache on the client by startTitleSync (avoids hydration mismatch)
    saveError: null,

    // D1 is the source of truth. Local only holds unsaved edits in progress.
    loadOverlays: async (force = false) => {
      if (loadingPromise) return loadingPromise
      if (!force && Date.now() - lastLoad < 2000) return
      loadingPromise = (async () => {
        try {
          const res = await fetch(`${READ_API}/title-overlays?t=${Date.now()}`, { cache: "no-store" })
          if (!res.ok) return
          const data: any = await res.json()
          if (!data?.overlays) return
          const cur = get().overlays
          const next: Record<string, TitleOverlayData> = {}
          for (const id of Object.keys(data.overlays)) {
            if (dirty.has(id) && cur[id]) { next[id] = cur[id]; continue } // don't clobber an edit in progress
            const raw = data.overlays[id]
            const on = raw === true || raw?.on === true
            const text = typeof raw?.text === "string" ? raw.text : ""
            const font = (typeof raw?.font === "string" && raw.font) || "cinzel"
            const style = raw?.style && typeof raw.style === "object" ? { ...DEFAULT_STYLE, ...raw.style } : undefined
            if (!on && !text.trim() && !style) continue // nothing worth keeping
            next[id] = { on, text, font, style }
          }
          for (const id of dirty) if (cur[id] && !next[id]) next[id] = cur[id]
          writeCache(next)
          set({ overlays: next })
        } catch {
          // offline / worker down: keep what we have (cache)
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
        on: cur?.on || false, // style alone never turns a title ON
        style: { ...DEFAULT_STYLE, ...(cur?.style || {}), ...patch }, // merged from the LATEST state, no stale spread
      })),

    setOverlay: (movieId, patch) =>
      apply(movieId, (cur) => ({
        text: patch.text !== undefined ? patch.text : cur?.text || "",
        font: patch.font !== undefined ? patch.font : cur?.font || "cinzel",
        on: patch.on !== undefined ? patch.on : cur?.on || false, // font/text edits never flip ON by themselves
        style: cur?.style,
      }), patch.on !== undefined),

    toggle: (movieId) =>
      apply(movieId, (cur) => {
        if (!cur) return null
        const nextOn = !cur.on
        if (nextOn && !cur.text?.trim()) return null // can't turn ON without real text
        return { ...cur, on: nextOn }
      }, true),
  }
})

// Call from anywhere (idempotent). Runs ONE load on app open, then again whenever the app returns to the foreground.
export function startTitleSync() {
  if (started || typeof window === "undefined") return
  started = true
  const cached = readCache()
  if (Object.keys(cached).length) useTitleMatrixStore.setState({ overlays: cached }) // instant paint
  void useTitleMatrixStore.getState().loadOverlays(true) // then D1 wins
  const refresh = () => { if (document.visibilityState === "visible") void useTitleMatrixStore.getState().loadOverlays() }
  document.addEventListener("visibilitychange", refresh)
  window.addEventListener("focus", refresh)
}
