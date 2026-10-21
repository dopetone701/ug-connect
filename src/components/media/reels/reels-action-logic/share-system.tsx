"use client"

// NOX - TIGHT GUARDED - NO CDN EXPOSURE
// Shares ONLY internal app URL, never preview_url / video_url / cdn url

type ShareMode = "reel" | "video"

// Guard: Only allow internal IDs, never full URLs
function sanitizeId(id: string): string {
  if (!id) return ""
  // strip any http, cdn, /, ? to prevent injection
  return String(id).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64)
}

export function getReelShareUrl(movieId: string, mode: ShareMode = "reel", time?: number) {
  if (typeof window === "undefined") return ""
  const safeId = sanitizeId(movieId)
  if (!safeId) return window.location.origin
  const origin = window.location.origin
  const params = new URLSearchParams()
  params.set("r", safeId)
  params.set("t", mode === "video" ? "full" : "reel")
  // time is optional, clamp it
  if (time && Number.isFinite(time) && time > 1 && time < 100000) {
    params.set("s", Math.floor(time).toString())
  }
  // IMPORTANT: Never put preview_urls, video_url, cdn in URL
  return `${origin}/reels?${params.toString()}`
}

export async function shareReel(movieId: string, movie?: { title?: string; name?: string }, mode: ShareMode = "reel", time?: number) {
  const safeId = sanitizeId(movieId)
  if (!safeId) return { shared: false as const, method: "invalid" as const }

  const url = getReelShareUrl(safeId, mode, time)
  // title only, never send video_url / preview_url / cover_url
  const title = (movie?.title || movie?.name || "UG Connect").slice(0, 100)
  const text = mode === "video" ? `Watch "${title}" on UG Connect` : `Watch this reel: "${title}" on UG Connect`

  // NATIVE DEVICE SHEET - OS handles apps
  if (typeof navigator !== "undefined" && (navigator as any).share) {
    try {
      await (navigator as any).share({ title, text, url })
      return { shared: true as const, method: "native" as const, url }
    } catch (err: any) {
      if (err?.name === "AbortError") return { shared: false as const, method: "cancelled" as const, url }
    }
  }

  // Fallback copy - still only internal URL
  try {
    await navigator.clipboard.writeText(url)
    return { shared: true as const, method: "clipboard" as const, url }
  } catch {
    return { shared: false as const, method: "unsupported" as const, url }
  }
}

export function useShare() {
  return { share: shareReel, getReelShareUrl }
}

