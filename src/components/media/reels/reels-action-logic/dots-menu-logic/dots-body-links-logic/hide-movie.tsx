"use client"
import { useDotsPanel } from "@/stores/use-dots-panel"
import { IconHide } from "./icons-launcher"

type Props = { movieId: string; movie?: any; onClose?: () => void }

export function HideMovieItem({ movieId, onClose }: Props) {
  const { close } = useDotsPanel()
  const handle = () => {
    try {
      const hidden = JSON.parse(localStorage.getItem("ugc_hidden_reels") || "[]")
      hidden.push(String(movieId))
      localStorage.setItem("ugc_hidden_reels", JSON.stringify([...new Set(hidden)]))
      window.dispatchEvent(new CustomEvent("ugc_hide_reel", { detail: movieId }))
    } catch {}
    onClose?.(); close()
  }
  return (
    <button className="dots-item" onClick={handle}>
      <span className="dots-icon"><IconHide /></span>
      <span className="dots-text">
        <span className="dots-title">Hide movie</span>
        <span className="dots-sub">I don't want to see this.</span>
      </span>
    </button>
  )
}
export default HideMovieItem

