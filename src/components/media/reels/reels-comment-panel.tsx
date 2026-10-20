"use client"
import { useCommentPanel } from "@/stores/use-comment-panel"
import { ReelsCommentBody } from "./reels-action-logic/reels-comment-body-full"
import "./reels.css"

export function ReelsCommentPanel() {
  const { isOpen, close, movieId, movie } = useCommentPanel() as any

  if (!isOpen || !movieId) return null

  return (
    <>
      <div className="reels-comment-backdrop" onClick={close} />
      <div className="reels-comment-panel open">
        <div className="reels-comment-handle" />
        <div className="reels-comment-header">
          <span>Comments</span>
          <button onClick={close} className="reels-comment-close">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ReelsCommentBody movieId={movieId} movie={movie} />
      </div>
    </>
  )
}

