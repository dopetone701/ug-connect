"use client"

export default function StandardSkin({ movie, videoRef, playing, showPlay, progress, volPct, isMuted, showVol, onTogglePlay, onTimeUpdate, onTouchStart, onTouchMove, onTouchEnd, onToggleMute, onExitFull, onOpenPreview, onShare }: any) {

  if (!movie) return null

  return (
    <div className="mob-full-root mode-landscape slide-in-left">

      {/* CLOSE BUTTON - LANDSCAPE ONLY */}
      <button className="mob-close-x" onClick={onExitFull} aria-label="Close full screen">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </svg>
      </button>

      {/* 
          VIDEO WRAP - FIXED OVERLAY
          ALL ACTIONS WRAPPED TOGETHER
          This is the only overlay, everything else is in vertical-skin
      */}
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

        {/* VOLUME COUNTER */}
        {showVol && (
          <div className="mob-vol-counter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              {volPct > 50 ? (
                <>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
              ) : volPct > 0 ? (
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              ) : null}
            </svg>
            <span>{isMuted ? 0 : volPct}%</span>
          </div>
        )}

        {/* PLAY / PAUSE FEEDBACK */}
        {showPlay && (
          <div className="apple-play-pure">
            {!playing ? (
              <svg viewBox="0 0 24 24" width="64" height="64" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }}>
                <path d="M8 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="64" height="64" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }}>
                <rect x="7" y="5" width="3.5" height="14" rx="1" />
                <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
              </svg>
            )}
          </div>
        )}

        {/* PROGRESS - ALWAYS ON VIDEO */}
        <div className="mob-progress-track">
          <div className="mob-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* FULL MODE ACTIONS - OVERLAY */}
        <div className="mob-full-btns">
          <button onClick={onOpenPreview} className="btn-preview">▶ Play Preview</button>
          <button className="btn-share" onClick={onShare}>Share</button>
          <button className="btn-list" onClick={(e) => e.stopPropagation()}>+ My List</button>
        </div>

      </div>
    </div>
  )
}
