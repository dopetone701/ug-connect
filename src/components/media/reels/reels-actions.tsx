"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function ReelsActions({
  onClose,
}: {
  onClose?: () => void
}) {
  const router = useRouter()
  const [comment, setComment] = useState("")

  const handleSendComment = () => {
    if (!comment.trim()) return

    console.log(comment)
    setComment("")
  }

  return (
    <>
      {/* =====================================================
          REELS TOP BAR
          Extracted from ReelsShell
          ===================================================== */}
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

      {/* =====================================================
          REELS ACTIONS
          Existing Like / Comment / Share / More buttons
          ===================================================== */}
      <div className="reel-actions">
        {/* LIKE */}
        <button
          type="button"
          className="ra-btn"
        >
          <span className="ra-icon-bg">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="hsl(var(--text))"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>

          <span className="ra-label">
            Like
          </span>
        </button>

        {/* COMMENTS */}
        <button
          type="button"
          className="ra-btn"
        >
          <span className="ra-icon-bg">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="hsl(var(--text))"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19.5 10.5c0 4.7-3.4 8-8 8-1.4 0-2.7-.3-3.8-.9L4 19l1.1-3.4c-.7-1.1-1.1-2.4-1.1-3.8 0-4.7 3.4-8 8-8s7.5 3.3 7.5 7.7z" />
              <path
                d="M8.5 11.8h.01M12 11.8h.01M15.5 11.8h.01"
                strokeWidth="2.4"
              />
            </svg>
          </span>

          <span className="ra-label">
            2.4k
          </span>
        </button>

        {/* SHARE */}
        <button
          type="button"
          className="ra-btn"
        >
          <span className="ra-icon-bg">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="hsl(var(--text))"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 16V3" />
              <path d="M7 8l5-5 5 5" />
              <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
            </svg>
          </span>

          <span className="ra-label">
            Share
          </span>
        </button>

        {/* MORE */}
        <button
          type="button"
          className="ra-btn"
          aria-label="More options"
        >
          <span className="ra-icon-bg">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="hsl(var(--text))"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19.5" cy="12" r="1.8" />
              <circle cx="4.5" cy="12" r="1.8" />
            </svg>
          </span>
        </button>
      </div>

      {/* =====================================================
          COMMENT BAR
          Extracted from ReelsShell
          ===================================================== */}
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
    </>
  )
}
