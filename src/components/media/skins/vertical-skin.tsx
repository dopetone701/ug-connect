"use client"

import { useState } from "react"
import SimilarMovies from "../../../app/(dashboard)/movies/watch/[id]/similar-movies"

export default function VerticalSkin({ movie, videoRef, playing, showPlay, progress, volPct, isMuted, showVol, onTogglePlay, onTimeUpdate, onTouchStart, onTouchMove, onTouchEnd, onToggleMute, onEnterFull, onOpenPreview, onShare }: any) {
  const [descOpen, setDescOpen] = useState(false)

  if (!movie) return null

  return (
    <div className="mob-full-root mode-youtube slide-in-left">

      <div
        className="mob-full-video-wrap"
        onClick={onTogglePlay}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <video
          ref={videoRef}
          poster={movie.cover_url || movie.cover || undefined}
          autoPlay
          playsInline
          controls={false}
          preload="auto"
          className="mob-full-video"
          onTimeUpdate={onTimeUpdate}
        />

        {showVol && (
          <div className="mob-vol-counter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            </svg>
            <span>{isMuted ? 0 : volPct}%</span>
          </div>
        )}

        <div className="mob-yt-topbar">
          <button className="mob-yt-icon" onClick={onToggleMute}>
            {isMuted || volPct === 0 ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
            )}
          </button>
          <button className="mob-yt-icon" onClick={onEnterFull}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2h-3" /></svg>
          </button>
        </div>

        {showPlay && (
          <div className="apple-play-pure">
            {!playing ? (
              <svg viewBox="0 0 24 24" width="64" height="64" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }}><path d="M8 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="64" height="64" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }}><rect x="7" y="5" width="3.5" height="14" rx="1" /><rect x="13.5" y="5" width="3.5" height="14" rx="1" /></svg>
            )}
          </div>
        )}

        <div className="mob-progress-track">
          <div className="mob-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mob-yt-actions-under">
        <button onClick={onOpenPreview} className="btn-preview">▶ Play Preview</button>
        <button className="btn-share" onClick={onShare}>Share</button>
        <button className="btn-list" onClick={(e) => e.stopPropagation()}>+ My List</button>
      </div>

      <div className="mob-full-body">
        <div className="mob-yt-handle" />
        <h2>{movie.title}</h2>
        <div className="mob-desc-wrap">
          <p className={["mob-full-desc", !descOpen ? "clamped" : ""].join(" ")}>{movie.description}</p>
          {!descOpen && movie.description?.length > 200 && (
            <button className="mob-desc-more" onClick={() => setDescOpen(true)}>...<span>more</span></button>
          )}
          {descOpen && (
            <button className="mob-desc-more" onClick={() => setDescOpen(false)}>less</button>
          )}
        </div>
        <SimilarMovies current={movie} />
      </div>
    </div>
  )
}
