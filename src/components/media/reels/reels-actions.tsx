"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ChatIcon from "@/modal-generator/svg-icons/message-bubble-square"
import { TheLoveSystem } from "./reels-action-logic/the-love-system"
import { useCommentPanel } from "@/stores/use-comment-panel"
import { briefNumber } from "@/stores/use-brief-numbers"
import { getEmojisForMovie } from "./reels-action-logic/reels-comment-section-logic/emoji-factory"
import { MyListSystem } from "./reels-action-logic/my-list-sytem"
import { shareReel, getReelShareUrl } from "./reels-action-logic/share-system"

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

type ShareMode = "reel" | "video"

type ReelsActionsProps = {
  onClose?: () => void
  movieId: string
  movie?: any
  heartCount?: number
  commentCount?: number
  shareCount?: number
  onCommentClick?: () => void
  mode?: ShareMode
}

export function SendIcon({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export function ReelsActions({
  onClose,
  movieId,
  movie,
  heartCount = 0,
  commentCount = 0,
  shareCount = 0,
  onCommentClick,
  mode = "reel",
}: ReelsActionsProps) {
  const router = useRouter()
  const [comment, setComment] = useState("")
  const [liveCommentCount, setLiveCommentCount] = useState(commentCount)
  const [liveShareCount, setLiveShareCount] = useState(shareCount)
  const [sending, setSending] = useState(false)
  const [sharing, setSharing] = useState(false)
  const { open } = useCommentPanel()

  useEffect(() => { setLiveCommentCount(commentCount) }, [commentCount])
  useEffect(() => { setLiveShareCount(shareCount) }, [shareCount])

  // Fetch live counts (comments + shares)
  useEffect(() => {
    if (!movieId) return
    const fetchCounts = async () => {
      try {
        const res = await fetch(`${WORKER_URL}/comments?movieId=${movieId}&deviceId=${getDeviceId()}`)
        const data = await res.json()
        if (typeof data.count === "number") setLiveCommentCount(data.count)
        if (typeof data.shareCount === "number") setLiveShareCount(data.shareCount)
        else if (typeof data.shares === "number") setLiveShareCount(data.shares)
        else if (Array.isArray(data.comments)) {
          const countTree = (list: any[]): number => list.reduce((acc, c) => acc + 1 + (c.replies ? countTree(c.replies) : 0), 0)
          setLiveCommentCount(countTree(data.comments))
        }
      } catch {}
    }
    fetchCounts()
    const interval = setInterval(fetchCounts, 8000)
    const onStorage = (e: StorageEvent) => {
      if (e.key === `reels_comments_updated_${movieId}` || e.key === `reels_shares_updated_${movieId}`) fetchCounts()
    }
    const onCustom = () => fetchCounts()
    window.addEventListener("storage", onStorage)
    window.addEventListener(`reels_comments_updated_${movieId}` as any, onCustom)
    window.addEventListener(`reels_shares_updated_${movieId}` as any, onCustom)
    window.addEventListener("reels_comment_deleted" as any, onCustom)
    return () => {
      clearInterval(interval)
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(`reels_comments_updated_${movieId}` as any, onCustom)
      window.removeEventListener(`reels_shares_updated_${movieId}` as any, onCustom)
      window.removeEventListener("reels_comment_deleted" as any, onCustom)
    }
  }, [movieId])

  const handleOpenComments = () => {
    open(movieId, movie)
    onCommentClick?.()
  }

  const handleSendComment = () => {
    if (comment.trim()) {
      try {
        sessionStorage.setItem(`reels_comment_draft_${movieId}`, comment)
        localStorage.setItem(`reels_comment_draft_${movieId}`, comment)
      } catch {}
    }
    const tempId = `temp-${Date.now()}`
    try { localStorage.setItem(`reels_last_sent_${movieId}`, tempId) } catch {}
    open(movieId, movie)
    setComment("")
    setTimeout(() => {
      document.querySelector('.reels-c-list, .reels-comment-list')?.scrollTo({ top: 0, behavior: 'smooth' })
    }, 400)
    onCommentClick?.()
  }

  const pack = getEmojisForMovie(movie)
  const genreChip = pack.emojis[0] || "💀💀💀"

  const handleInstantSend = async () => {
    if (sending) return
    setSending(true)
    setLiveCommentCount(prev => prev + 1)
    const tempId = `temp-${Date.now()}`
    try {
      const res = await fetch(`${WORKER_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, text: genreChip, deviceId: getDeviceId() })
      })
      if (!res.ok) throw new Error("failed")
      localStorage.setItem(`reels_comments_updated_${movieId}`, Date.now().toString())
      localStorage.setItem(`reels_last_sent_${movieId}`, tempId)
      window.dispatchEvent(new CustomEvent(`reels_comments_updated_${movieId}`))
      open(movieId, movie)
      setTimeout(() => {
        const list = document.querySelector('.reels-c-list, .reels-comment-list') as HTMLElement
        if (list) list.scrollTo({ top: 0, behavior: 'smooth' })
      }, 400)
    } catch {
      setLiveCommentCount(prev => Math.max(0, prev - 1))
      try { sessionStorage.setItem(`reels_comment_draft_${movieId}`, genreChip) } catch {}
      open(movieId, movie)
    } finally {
      setTimeout(() => setSending(false), 500)
    }
  }

  // ---- SAFE SHARE WITH COUNT ----
  const handleShare = async () => {
    if (sharing) return
    setSharing(true)

    // Get current time for deep link (receiver will start at same second)
    let currentTime = 0
    try {
      const vid = document.querySelector('.reels-tiktok-item.active .reel-video') as HTMLVideoElement
      if (vid && Number.isFinite(vid.currentTime)) currentTime = vid.currentTime
    } catch {}

    const result = await shareReel(movieId, movie, mode, currentTime)

    if (result.shared) {
      // Optimistic +1
      setLiveShareCount(prev => prev + 1)

      // Persist for backend counting
      try {
        localStorage.setItem(`reels_shares_updated_${movieId}`, Date.now().toString())
        window.dispatchEvent(new CustomEvent(`reels_shares_updated_${movieId}`))
      } catch {}

      // Fire to worker - SAFE, no blocking UI
      fetch(`${WORKER_URL}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId,
          deviceId: getDeviceId(),
          mode,
          time: Math.floor(currentTime),
        }),
      }).catch(() => {})
    }

    setTimeout(() => setSharing(false), 800)
  }

  return (
    <>
      <div className="reel-top-bar">
        <button type="button" className="reel-close-v" onClick={() => (onClose ? onClose() : router.back())} aria-label="Close preview">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <button type="button" className="reel-search" onClick={() => router.push("/search")} aria-label="Search">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6" /><path d="M21 21l-3.8-3.8" /></svg>
        </button>
      </div>

      <div className="reel-actions">
        <TheLoveSystem movieId={movieId} initialCount={heartCount} size={22} />
        <button type="button" className="ra-btn" onClick={handleOpenComments}>
          <span className="ra-icon-bg"><ChatIcon size={22} style={{ color: "hsl(var(--text))" }} /></span>
          <span className="ra-label">{liveCommentCount > 0 ? briefNumber(liveCommentCount) : "0"}</span>
        </button>
        {/* MY LIST + -> TICK - INSERTED, NO LOGIC REMOVED */}
        <MyListSystem movieId={movieId} movie={movie} size={22} variant="reels" />
        <button type="button" className="ra-btn" onClick={handleShare} disabled={sharing} aria-label="Share">
          <span className="ra-icon-bg">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="hsl(var(--text))" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V3" />
              <path d="M7 8l5-5 5 5" />
              <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
            </svg>
          </span>
          <span className="ra-label">{liveShareCount > 0 ? briefNumber(liveShareCount) : "Share"}</span>
        </button>
        <button type="button" className="ra-btn" aria-label="More options">
          <span className="ra-icon-bg"><svg viewBox="0 0 24 24" width="22" height="22" fill="hsl(var(--text))"><circle cx="12" cy="12" r="1.8" /><circle cx="19.5" cy="12" r="1.8" /><circle cx="4.5" cy="12" r="1.8" /></svg></span>
        </button>
      </div>

      <div className="reel-comment-bar">
        <div className="reel-input-wrap">
          <input
            type="text"
            inputMode="text"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onFocus={handleOpenComments}
            onKeyDown={(e) => { if (e.key === "Enter") handleSendComment() }}
            className="reel-comment-input"
          />
          <button
            type="button"
            className={`reel-chip-floating ${sending ? 'sending' : ''}`}
            onClick={handleInstantSend}
            disabled={sending}
          >
            {genreChip}
          </button>
        </div>
        <button type="button" className="reel-comment-send" onClick={handleSendComment} aria-label="Send comment">
          <SendIcon size={22} />
        </button>
      </div>
    </>
  )
}

