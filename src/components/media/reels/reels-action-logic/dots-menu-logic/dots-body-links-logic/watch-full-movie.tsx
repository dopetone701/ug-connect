"use client"
import { useWatchDrawer } from "@/stores/use-watch-drawer"
import { useDotsPanel } from "@/stores/use-dots-panel"
import { IconPlay } from "./icons-launcher"

type Props = { movieId: string; movie?: any; onClose?: () => void }

function cleanVj(raw: any): string {
  if (!raw) return ""
  let s = String(raw).trim()
  s = s.replace(/^VJ\s+/i, "").replace(/^VJ$/i, "").trim()
  s = s.replace(/^VJ\.\s*/i, "").trim()
  return s
}

function getRealVj(movie: any): string {
  if (!movie) return "UG"
  const raw = movie.vj || movie.translatedBy || movie.vjs?.[0] || movie.channel || movie.narrator || movie.vjs || movie.VJ || ""
  const cleaned = cleanVj(raw)
  if (cleaned && cleaned.toUpperCase() !== "UG") return cleaned
  try {
    const ls = localStorage.getItem("ugc_current_vj") || localStorage.getItem("ugc_last_reel_vj")
    if (ls) {
      const lsClean = cleanVj(ls)
      if (lsClean && lsClean.toUpperCase() !== "UG") return lsClean
    }
  } catch {}
  return cleaned || "UG"
}

export function FullMovieReadyItem({ movieId, movie, onClose }: Props) {
  const { openDrawer } = useWatchDrawer() as any
  const { close } = useDotsPanel()
  const vjName = getRealVj(movie)

  const handle = () => {
    try {
      const preview = (movie as any)?.preview_urls?.[0] || (movie as any)?.preview_url || (movie as any)?.trailer_url
      sessionStorage.setItem(`movie_preload_${movieId}`, JSON.stringify({
        id: String(movieId),
        title: movie?.title,
        cover_url: movie?.cover || movie?.cover_url,
        video_url: movie?.video || movie?.video_url,
        preview_url: preview,
        preview_urls: movie?.preview_urls || (preview ? [preview] : []),
        genre: movie?.genre,
        vj: vjName,
        description: movie?.description || movie?.desc,
      }))
      if (vjName && vjName.toUpperCase() !== "UG") {
        localStorage.setItem("ugc_current_vj", vjName)
        localStorage.setItem("ugc_last_reel_vj", vjName)
      }
    } catch {}
    onClose?.(); close()
    setTimeout(()=> openDrawer(String(movieId)), 150)
  }

  return (
    <button className="dots-item" onClick={handle}>
      <span className="dots-icon"><IconPlay /></span>
      <span className="dots-text">
        <span className="dots-title">Watch full movie</span>
        <span className="dots-sub">Full movie ready</span>
      </span>
    </button>
  )
}

export default FullMovieReadyItem

