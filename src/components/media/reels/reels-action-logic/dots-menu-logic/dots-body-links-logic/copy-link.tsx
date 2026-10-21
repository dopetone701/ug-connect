"use client"
import { useState } from "react"
import { useDotsPanel } from "@/stores/use-dots-panel"
import { getReelShareUrl } from "../../share-system"
import { IconLink } from "./icons-launcher"

type Props = { movieId: string; movie?: any; onClose?: () => void }

export function CopyLinkItem({ movieId, movie, onClose }: Props) {
  const { close } = useDotsPanel()
  const [copied, setCopied] = useState(false)

  const handle = async () => {
    const url = getReelShareUrl(String(movieId), "reel")
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(()=>{ setCopied(false); onClose?.(); close() }, 700)
    } catch {
      onClose?.(); close()
    }
  }

  return (
    <button className="dots-item" onClick={handle}>
      <span className="dots-icon"><IconLink /></span>
      <span className="dots-text">
        <span className="dots-title">{copied ? "Copied!" : "Copy link"}</span>
        <span className="dots-sub">{copied ? "Link copied to clipboard" : "Copy link for this movie"}</span>
      </span>
    </button>
  )
}
export default CopyLinkItem

