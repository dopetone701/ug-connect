"use client"

type Props = {
  start: number
  end: number
  freeEpisodes: number
  currentEpisode?: number
  onSelect: (episode: number) => void
  movie?: any
}

function getPreviewForEpisode(movie: any, episodeNum: number): string | null {
  if (!movie) return null
  
  let seasons: any = movie.seasons
  if (typeof seasons === "string") { try { seasons = JSON.parse(seasons) } catch {} }
  
  if (Array.isArray(seasons)) {
    let count = 0
    for (const s of seasons) {
      if (!Array.isArray(s.episodes)) continue
      for (const ep of s.episodes) {
        count++
        if (count === episodeNum) {
          if (ep.preview_url && typeof ep.preview_url === "string") return ep.preview_url
          if (ep.previewUrl && typeof ep.previewUrl === "string") return ep.previewUrl
          if (ep.cover_url && typeof ep.cover_url === "string" && ep.cover_url.includes("preview")) return ep.cover_url
          return null
        }
      }
    }
  }
  return null
}

function getGlobalFallback(movie: any): string | null {
  if (!movie) return null
  let previews: any = movie.preview_urls
  if (typeof previews === "string") { try { previews = JSON.parse(previews) } catch {} }
  if (Array.isArray(previews) && previews.length) return previews[0]
  if (typeof movie.preview_url === "string") return movie.preview_url
  return movie.main_url || movie.video_url || null
}

function getR2Url(key: any): string | null {
  if (!key) return null
  if (typeof key !== "string") return null
  if (key.startsWith("http://") || key.startsWith("https://") || key.startsWith("blob:")) return key
  return `https://movie-creation-portal-api.connectu89.workers.dev/r2/${key}`
}

export function EpisodesGrid({ start, end, freeEpisodes, currentEpisode, onSelect, movie }: Props) {
  const episodes = Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i)

  return (
    <div className="reps-grid">
      {episodes.map((n) => {
        const vip = n > freeEpisodes
        const precisePreview = getPreviewForEpisode(movie, n)
        const hasPrecise = !!precisePreview
        
        return (
          <button
            key={n}
            type="button"
            className={`reps-ep ${vip ? "vip" : ""} ${n === currentEpisode ? "current" : ""} ${hasPrecise ? "has-preview" : ""}`}
            onClick={() => {
              // NEW: try precise preview for this episode, fallback to global
              const targetPreview = precisePreview || getGlobalFallback(movie)
              
              // Dispatch event so ReelsPlayer can switch to this exact preview
              if (targetPreview && movie) {
                const url = getR2Url(targetPreview) || targetPreview
                window.dispatchEvent(new CustomEvent("reels-play-precise-preview", {
                  detail: { movieId: String(movie.id), episode: n, previewUrl: url, previewKey: targetPreview }
                }))
                // Also save to session so watch page knows
                try {
                  sessionStorage.setItem(`reels-precise-preview-${movie.id}-${n}`, url)
                } catch {}
              }
              
              onSelect(n)
            }}
            title={hasPrecise ? `Ep ${n} - has own preview` : `Ep ${n} - uses global preview`}
          >
            <span className="reps-ep-num">{n}</span>
            {hasPrecise && <span className="reps-ep-dot" style={{ width: 6, height: 6, background: "hsl(var(--primary))", borderRadius: "50%", position: "absolute", top: 4, right: 4 }} />}
            {vip && <span className="reps-ep-vip">VIP</span>}
          </button>
        )
      })}
    </div>
  )
}

export default EpisodesGrid
