// open-preview.ts — Facebook-style precise opening, NO home flash
// Rule: open Reels FIRST, close Watch SECOND. Never navigate to /movies.

export function normalizePreviewMovie(x: any) {
  const preview =
    x?.preview_urls?.[0] ||
    x?.preview_url ||
    x?.trailer_url ||
    x?.video_preview_url ||
    x?.preview

  return {
    ...x,
    id: String(x.id),
    preview_url: preview,
    preview_urls: x.preview_urls || (preview ? [preview] : []),
    trailer_url: x.trailer_url || preview,
  }
}

export function buildPreviewQueue(clickedMovie: any, allMovies: any[]) {
  const clicked = normalizePreviewMovie(clickedMovie)
  const rest = (allMovies || [])
    .filter((m: any) => String(m.id) !== String(clicked.id))
    .map(normalizePreviewMovie)
  return [clicked, ...rest]
}

export function openPreviewForMovie({
  movie,
  allMovies,
  openReels,
  closeDrawer,
  isOverlay,
}: {
  movie: any
  allMovies: any[]
  openReels: (list: any[], index: number) => void
  closeDrawer?: () => void
  isOverlay?: boolean
}) {
  if (!movie) return []

  const queue = buildPreviewQueue(movie, allMovies)

  // ✅ FIX: Open Reels IMMEDIATELY, synchronously.
  // No setTimeout, no router.replace("/movies"), no gap.
  // Reels drawer is fixed inset:0 black — it covers Watch Drawer instantly.
  openReels(queue, 0)

  // ✅ THEN close Watch underneath, after Reels is already mounted.
  // User never sees Home, never sees a blank frame.
  if (isOverlay) {
    requestAnimationFrame(() => {
      closeDrawer?.()
    })
  }

  return queue
}

export default openPreviewForMovie
