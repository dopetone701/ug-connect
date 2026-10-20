"use client"
import { useRef, useEffect } from "react"

export function DotsMenuIcon({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="reels-c-dots-btn" type="button">
      <svg viewBox="0 0 100 100" width={16} height={16}><circle cx="28" cy="50" r="6" fill="currentColor" opacity={0.8} /><circle cx="50" cy="50" r="6" fill="currentColor" opacity={0.8} /><circle cx="72" cy="50" r="6" fill="currentColor" opacity={0.8} /></svg>
    </button>
  )
}

// ONLY show Delete if isOwn = true (your own comment)
export function DotsDropdown({ isOwn, liked, onReply, onShare, onLike, onDelete }: any) {
  return (
    <div className="reels-c-menu-dropdown">
      <button onClick={onReply} className="reels-c-menu-item" type="button">💬 Reply</button>
      <button onClick={onShare} className="reels-c-menu-item" type="button">↗️ Share</button>
      <button onClick={onLike} className="reels-c-menu-item" type="button">❤️ {liked ? "Unlike" : "Like"}</button>
      {isOwn ? (
        <button onClick={onDelete} className="reels-c-menu-item danger" type="button">🗑️ Delete</button>
      ) : null}
    </div>
  )
}

export function useClickOutside(show: boolean, ref: React.RefObject<HTMLElement>, onClose: () => void) {
  useEffect(() => {
    const handle = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    if (show) document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [show])
}

