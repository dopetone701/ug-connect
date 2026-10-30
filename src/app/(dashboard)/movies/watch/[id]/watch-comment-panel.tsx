"use client"

import "./watch-comment-panel.css"
// Adjust this path to wherever reels-comment-body.tsx lives in your project.
import { ReelsCommentBodyFull } from "@/components/media/reels/reels-action-logic/reels-comment-body-full"



type Props = {
  movieId: string
  movie?: any
  onCountChange?: (count: number) => void
}

export function WatchCommentPanel({ movieId, movie, onCountChange }: Props) {
  return (
    <section className="watch-comments" aria-label="Comments">
      <h2 className="watch-comments-title">Comments</h2>
      <div className="watch-comments-card">
        <ReelsCommentBodyFull
          movieId={movieId}
          movie={movie}
          onCountChange={onCountChange}
        />
      </div>
    </section>
  )
}

export default WatchCommentPanel


