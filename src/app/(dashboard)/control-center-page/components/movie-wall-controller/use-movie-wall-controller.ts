"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// ============================================================
// use-movie-wall-controller.ts — THE STORE (single truth)
// Wall NEVER writes here. Controller writes here.
// Wall only READS: getClip(battleKey) -> { start, end }
// If no clip exists -> Wall behaves exactly like today (fallback).
// ============================================================

export type PreviewClip = {
  battleKey: string
  title: string
  start: number // seconds - MASTER timeline
  end: number // seconds - MASTER timeline
  duration: number // seconds - longest VJ duration in battle, for clamping
  perVjOffset: Record<string, number> // movieId -> seconds to nudge that VJ to same scene
  isAuto: boolean // true = auto-suggested, false = manually chopped
  isApproved: boolean // admin reviewed it
  updatedAt: number
}

export const DEFAULT_PREVIEW_SECONDS = 35
export const AUTO_START_RATIO = 0.25 // skip intro, start at 25% of movie
export const AUTO_END_RATIO = 0.92 // never go into credits

// Pure math — auto suggest a timeline for any duration
export function autoSuggestClip(duration: number, clipSeconds = DEFAULT_PREVIEW_SECONDS): { start: number; end: number } {
  if (!duration || duration <= 0) return { start: 0, end: clipSeconds }
  if (duration <= clipSeconds + 5) return { start: 0, end: duration }
  let start = Math.floor(duration * AUTO_START_RATIO)
  let end = start + clipSeconds
  const maxEnd = Math.floor(duration * AUTO_END_RATIO)
  if (end > maxEnd) {
    end = maxEnd
    start = Math.max(0, end - clipSeconds)
  }
  return { start, end }
}

export function formatTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
}

// Effective start/end for ONE VJ = master + its offset, clamped
export function clipForVj(clip: PreviewClip, movieId: string) {
  const offset = clip.perVjOffset?.[String(movieId)] || 0
  const start = Math.max(0, clip.start + offset)
  const end = Math.max(start + 1, clip.end + offset)
  return { start, end, offset }
}

type ControllerState = {
  clips: Record<string, PreviewClip>
  selectedBattleKey: string | null
  // actions
  selectBattle: (key: string | null) => void
  getClip: (battleKey: string) => PreviewClip | undefined
  setClip: (battleKey: string, patch: Partial<PreviewClip> & { title?: string; duration?: number }) => void
  setMaster: (battleKey: string, start: number, end: number, meta?: { title?: string; duration?: number }) => void
  setVjOffset: (battleKey: string, movieId: string, offset: number) => void
  autoGenerate: (battleKey: string, duration: number, title?: string) => PreviewClip
  approve: (battleKey: string) => void
  unapprove: (battleKey: string) => void
  clearClip: (battleKey: string) => void
}

export const useMovieWallController = create<ControllerState>()(
  persist(
    (set, get) => ({
      clips: {},
      selectedBattleKey: null,
      selectBattle: (key) => set({ selectedBattleKey: key }),
      getClip: (battleKey) => get().clips[battleKey],
      setClip: (battleKey, patch) =>
        set((s) => {
          const prev = s.clips[battleKey]
          const base: PreviewClip = prev || {
            battleKey,
            title: patch.title || battleKey,
            start: 0,
            end: DEFAULT_PREVIEW_SECONDS,
            duration: patch.duration || 0,
            perVjOffset: {},
            isAuto: true,
            isApproved: false,
            updatedAt: Date.now(),
          }
          return { clips: { ...s.clips, [battleKey]: { ...base, ...patch, battleKey, updatedAt: Date.now() } } }
        }),
      // Chop ALL at once — master moves, every VJ follows (plus its own offset)
      setMaster: (battleKey, start, end, meta) => {
        const s = Math.max(0, Math.min(start, end - 1))
        const e = Math.max(s + 1, end)
        get().setClip(battleKey, { start: s, end: e, isAuto: false, isApproved: true, title: meta?.title, duration: meta?.duration })
      },
      setVjOffset: (battleKey, movieId, offset) => {
        const prev = get().clips[battleKey]
        if (!prev) return
        const clamped = Math.max(-120, Math.min(120, Math.round(offset)))
        get().setClip(battleKey, { perVjOffset: { ...prev.perVjOffset, [String(movieId)]: clamped }, isApproved: true })
      },
      autoGenerate: (battleKey, duration, title) => {
        const { start, end } = autoSuggestClip(duration)
        const clip: PreviewClip = {
          battleKey, title: title || battleKey, start, end, duration,
          perVjOffset: {}, isAuto: true, isApproved: true, updatedAt: Date.now(),
        }
        set((s) => ({ clips: { ...s.clips, [battleKey]: clip } }))
        return clip
      },
      approve: (battleKey) => get().setClip(battleKey, { isApproved: true }),
      unapprove: (battleKey) => get().setClip(battleKey, { isApproved: false }),
      clearClip: (battleKey) =>
        set((s) => {
          const next = { ...s.clips }
          delete next[battleKey]
          return { clips: next }
        }),
    }),
    { name: "ug-movie-wall-controller-v1", partialize: (s) => ({ clips: s.clips, selectedBattleKey: s.selectedBattleKey }) }
  )
)

// Helper for Wall (read-only) — import this in movie-wall-body later, 1 line
export function getWallPreviewClip(battleKey: string): PreviewClip | undefined {
  return useMovieWallController.getState().clips[battleKey]
}

