"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// PRO IMPORTS
import ChatIcon from "@/modal-generator/svg-icons/message-bubble-square"
import { TheLoveSystem } from "./reels-action-logic/the-love-system"
import { useCommentPanel } from "@/stores/use-comment-panel"
import { briefNumber } from "@/stores/use-brief-numbers"

const WORKER_URL = "https://comment-actions-server-api.connectu89.workers.dev"

function getDeviceId() {
  if (typeof window === "undefined") return "dev"
  let id = localStorage.getItem("ugc_device_id")
  if (!id) {
    id = `dev_${Math.random().toString(36).slice(2)}${Date.now()}`
    localStorage.setItem("ugc_device_id", id)
  }
  return id
}

type ReelsActionsProps = {
  onClose?: () => void
  movieId: string
  heartCount?: number
  commentCount?: number
  onCommentClick?: () => void
  onShareClick?: () => void
}

export function ReelsActions({
  onClose,
  movieId,
  heartCount = 0,
  commentCount = 0,
  onCommentClick,
  onShareClick,
}: ReelsActionsProps) {
  const router = useRouter()
  const [comment, setComment] = useState("")
  const [liveCommentCount, setLiveCommentCount] = useState(commentCount)
  const { open } = useCommentPanel()

  // Sync prop count
  useEffect(() => {
    setLiveCommentCount(commentCount)
  }, [commentCount])

  // Live count fetch from D1
  useEffect(() => {
    if (!movieId) return
    const fetchCount = async () => {
      try {
        const res = await fetch(`${WORKER_URL}/comments?movieId=${movieId}&deviceId=${getDeviceId()}`)
        const data = await res.json()
        if (typeof data.count === "number") {
          setLiveCommentCount(data.count)
        } else if (Array.isArray(data.comments)) {
          // fallback: count tree
          const countTree = (list: any[]): number =>
            list.reduce((acc, c) => acc + 1 + (c.replies ? countTree(c.replies) : 0), 0)
          setLiveCommentCount(countTree(data.comments))
        }
      } catch {}
    }
    fetchCount()
    const interval = setInterval(fetchCount, 8000)
    const onStorage = (e: StorageEvent) => {
      if (e.key === `reels_comments_updated_${movieId}`) fetchCount()
    }
    const onCustom = () => fetchCount()
    window.addEventListener("storage", onStorage)
    window.addEventListener(`reels_comments_updated_${movieId}` as any, onCustom)
    window.addEventListener("reels_comment_deleted" as any, onCustom)
    return () => {
      clearInterval(interval)
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(`reels_comments_updated_${movieId}` as any, onCustom)
      window.removeEventListener("reels_comment_deleted" as any, onCustom)
    }
  }, [movieId])

  const handleOpenComments = () => {
    open(movieId)
    onCommentClick?.()
  }

  const handleSendComment = () => {
    // Quick tap -> open pro panel (panel has its own input + reply + emoji)
    if (comment.trim()) {
      // Save quick draft for panel to pick up
      try { 
        sessionStorage.setItem(`reels_comment_draft_${movieId}`, comment)
        localStorage.setItem(`reels_comment_draft_${movieId}`, comment)
      } catch {}
    }
    open(movieId)
    setComment("")
    onCommentClick?.()
  }

  return (
    <>
      {/* REELS TOP BAR */}
      <div className="reel-top-bar">
        <button
          type="button"
          className="reel-close-v"
          onClick={() => (onClose ? onClose() : router.back())}
          aria-label="Close preview"
        >
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          className="reel-search"
          onClick={() => router.push("/search")}
          aria-label="Search"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="6" />
            <path d="M21 21l-3.8-3.8" />
          </svg>
        </button>
      </div>

      {/* REELS ACTIONS */}
      <div className="reel-actions">
        {/* LIKE - SAFE FROM THE-LOVE-SYSTEM */}
        <TheLoveSystem movieId={movieId} initialCount={heartCount} size={22} />

        {/* COMMENTS - NOW OPENS PRO PANEL + LIVE COUNT */}
        <button type="button" className="ra-btn" onClick={handleOpenComments}>
          <span className="ra-icon-bg">
            <ChatIcon size={22} style={{ color: "hsl(var(--text))" }} />
          </span>
          <span className="ra-label">
            {liveCommentCount > 0 ? briefNumber(liveCommentCount) : "0"}
          </span>
        </button>

        {/* SHARE */}
        <button type="button" className="ra-btn" onClick={onShareClick}>
          <span className="ra-icon-bg">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="hsl(var(--text))" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 16V3" />
              <path d="M7 8l5-5 5 5" />
              <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
            </svg>
          </span>
          <span className="ra-label">Share</span>
        </button>

        {/* MORE */}
        <button type="button" className="ra-btn" aria-label="More options">
          <span className="ra-icon-bg">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="hsl(var(--text))" aria-hidden="true">
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19.5" cy="12" r="1.8" />
              <circle cx="4.5" cy="12" r="1.8" />
            </svg>
          </span>
        </button>
      </div>

      {/* COMMENT BAR - NOW TRIGGERS PANEL */}
      <div
        className="reel-comment-bar"
        style={{
          background: "hsl(var(--surface))",
          borderTop: "1px solid hsl(var(--border))",
          height: "auto",
          minHeight: "calc(56px + env(safe-area-inset-bottom))",
          paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
        }}
      >
        <input
          type="text"
          inputMode="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onFocus={handleOpenComments}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendComment()
          }}
          className="reel-comment-input"
          style={{
            background: "hsl(var(--bg))",
            color: "hsl(var(--text))",
            border: "1px solid hsl(var(--border))",
          }}
        />

        <button
          type="button"
          className="reel-comment-send"
          style={{ color: "hsl(var(--primary))" }}
          onClick={handleSendComment}
          aria-label="Send comment"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </>
  )
}

