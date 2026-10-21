"use client"
import { useEffect, useState } from "react"
import { IconAuto } from "./icons-launcher"

type Props = { movieId?: string; movie?: any; onClose?: () => void }

export function AutoScrollItem({}: Props) {
  const [autoScroll, setAutoScroll] = useState(false)

  useEffect(()=>{
    try {
      const v = localStorage.getItem("ugc_auto_scroll")
      setAutoScroll(v === "true")
    } catch {}
  }, [])

  const toggle = () => {
    const next = !autoScroll
    setAutoScroll(next)
    try {
      localStorage.setItem("ugc_auto_scroll", String(next))
      window.dispatchEvent(new CustomEvent("ugc_auto_scroll_changed", { detail: next }))
      // Also dispatch storage-like event for cross-listener
      window.dispatchEvent(new CustomEvent("ugc_auto_scroll_activation", { detail: next }))
    } catch {}
  }

  return (
    <div className="dots-auto-row">
      <span className="dots-auto-icon"><IconAuto /></span>
      <span className="dots-auto-label">{autoScroll ? "Auto-scroll enabled" : "Auto-scroll to next movie"}</span>
      <button className={`dots-toggle ${autoScroll ? "on" : ""}`} onClick={toggle} aria-label="Toggle auto scroll">
        <span className="dots-toggle-knob" />
      </button>
    </div>
  )
}
export default AutoScrollItem

