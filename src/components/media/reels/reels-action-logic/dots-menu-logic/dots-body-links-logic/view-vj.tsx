"use client"
import { useRouter } from "next/navigation"
import { useDotsPanel } from "@/stores/use-dots-panel"
import { IconUser } from "./icons-launcher"

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

export function ViewVjItem({ movieId, movie, onClose }: Props) {
  const router = useRouter()
  const { close } = useDotsPanel()
  const vjName = getRealVj(movie)
  const isValidVj = vjName && vjName.toUpperCase() !== "UG"

  const handle = () => {
    const target = isValidVj ? vjName : "UG"
    try {
      localStorage.setItem("ugc_current_vj", target)
      localStorage.setItem("ugc_last_reel_vj", target)
    } catch {}
    onClose?.(); close()
    const param = encodeURIComponent(target)
    setTimeout(()=> router.push(`/search?q=${param}&filter=vj&section=vj`), 100)
  }

  return (
    <button className="dots-item" onClick={handle}>
      <span className="dots-icon"><IconUser /></span>
      <span className="dots-text">
        <span className="dots-title">{isValidVj ? `View VJ ${vjName}` : "View VJ"}</span>
        <span className="dots-sub">{isValidVj ? `View more from ${vjName}` : "View more from this VJ"}</span>
      </span>
    </button>
  )
}

export default ViewVjItem

