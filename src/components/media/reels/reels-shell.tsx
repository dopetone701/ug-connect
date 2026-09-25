"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import "./reels.css"

export function ReelsShell({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose?: () => void
}) {
  const router = useRouter()
  const [comment, setComment] = useState("")

  const handleSendComment = () => {
    if (!comment.trim()) return

    console.log(comment)
    setComment("")
  }

  /*
   * ----------------------------------------
   * SILENT REELS CLOSE
   * ----------------------------------------
   *
   * ReelsPlayer calls this when the viewport
   * changes from mobile → desktop.
   *
   * IMPORTANT:
   * This does NOT call router.back().
   * It simply removes the Reels drawer through
   * the existing onClose handler.
   */
  useEffect(() => {
    const silentClose = () => {
      if (onClose) {
        onClose()
      }
    }

    ;(window as any).__UG_CLOSE_REELS_SILENT__ =
      silentClose

    return () => {
      if (
        (window as any).__UG_CLOSE_REELS_SILENT__ ===
        silentClose
      ) {
        delete (window as any).__UG_CLOSE_REELS_SILENT__
      }
    }
  }, [onClose])

  /*
   * ----------------------------------------
   * HANDOFF BRIDGE
   * ----------------------------------------
   *
   * ReelsPlayer saves the current video position
   * into sessionStorage before this shell closes.
   *
   * This function is available globally so the
   * player can trigger the transition without
   * needing to know anything about this component.
   */
  useEffect(() => {
    ;(window as any).__UG_REELS_READY_FOR_DESKTOP__ =
      true

    return () => {
      delete (window as any).__UG_REELS_READY_FOR_DESKTOP__
    }
  }, [])

  if (typeof document === "undefined") return null

  return (
    <div className="reel-root">
      <div className="reel-top-bar">
        <button
          type="button"
          className="reel-close-v"
          onClick={() =>
            onClose
              ? onClose()
              : router.back()
          }
          aria-label="Close preview"
        >
          <svg
            viewBox="0 0 24 24"
            width="26"
            height="26"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          className="reel-search"
          onClick={() => router.push("/search")}
          aria-label="Search"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6" />
            <path d="M21 21l-3.8-3.8" />
          </svg>
        </button>
      </div>

      {/* REELS CONTENT */}
      <div className="reel-swiper">
        {children}
      </div>

      {/* COMMENT BAR */}
      <div
        className="reel-comment-bar"
        style={{
          background: "hsl(var(--surface))",
          borderTop:
            "1px solid hsl(var(--border))",
        }}
      >
        <input
          type="text"
          inputMode="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendComment()
            }
          }}
          className="reel-comment-input"
          style={{
            background: "hsl(var(--bg))",
            color: "hsl(var(--text))",
            border:
              "1px solid hsl(var(--border))",
          }}
        />

        <button
          type="button"
          className="reel-comment-send"
          style={{
            color: "hsl(var(--primary))",
          }}
          onClick={handleSendComment}
          aria-label="Send comment"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line
              x1="22"
              y1="2"
              x2="11"
              y2="13"
            />

            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
