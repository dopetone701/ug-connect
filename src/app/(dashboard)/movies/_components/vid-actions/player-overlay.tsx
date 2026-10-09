"use client";

import BackBtn from "../back-btn";

export default function PlayerOverlay({
  movie,
  showControls,
  isLoading,
  playing,
  progress,
  bufferedProgress,
  currentTime,
  duration,
  isFullScreen,
  isMobile = false,
  formatTime,
  onSeek,
  onTogglePlay,
  onToggleFullscreen,
  onBack,
  onShowControls,
  onClose,
  onExpand,
  isMini = false,
}: any) {

  const keepControlsVisible = () => {
    onShowControls?.();
  };

  if (isMini) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        <button
          className="bubble-expand"
          style={{ pointerEvents: "auto" }}
          onClick={(e) => {
            e.stopPropagation();
            (onExpand || onToggleFullscreen)?.();
          }}
          aria-label="Expand"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
        <button
          className="bubble-close"
          style={{ pointerEvents: "auto" }}
          onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  keepControlsVisible();
  onBack?.();
}}

          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 1L11 11M11 1L1 11" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* === FIXED BACK BTN: ALWAYS VISIBLE, OUTSIDE center-top, HIDDEN IN FULLSCREEN === */}
      {!isFullScreen && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            zIndex: 60,
            pointerEvents: "auto",
          }}
        >
          {isMobile ? (
            <button
  type="button"
  onPointerUp={(e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.button !== 0) return;

    keepControlsVisible();
    onBack?.();
  }}
  onClick={(e) => {
    // Prevent the synthesized click from triggering another action.
    e.preventDefault();
    e.stopPropagation();
  }}
  className="w-10 h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white border border-white/10"
  aria-label="Minimize"
  style={{
    pointerEvents: "auto",
    touchAction: "manipulation",
  }}
>

              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          ) : (
            <BackBtn
              onClick={() => {
                keepControlsVisible();
                onBack();
              }}
              className="w-8 h-8 mr-1"
            />
          )}
        </div>
      )}

      {/* TOP BAR - pill + logo only */}
      <div className={`center-top ${showControls ? "show" : ""}`} style={{ pointerEvents: showControls ? "auto" : "none" }}>
        <div className="top-left" style={{ marginLeft: isMobile && !isFullScreen ? "52px" : "0" }}>
          <div className="top-pills">
            <span className="c-pill">{movie?.vj}</span>
          </div>
        </div>
        <div className="fullscreen-logo top-right">
          <img src="/logo.png" alt="logo" />
        </div>
      </div>

      {isLoading && (
        <div className="connect-loader">
          <div className="connect-spinner" />
        </div>
      )}

      {!playing && !isLoading && (
        <button type="button" className="play-apple" onClick={() => { keepControlsVisible(); onTogglePlay(); }} aria-label="Play">
          <span className="play-apple-core">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8.2 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z" fill="white" />
            </svg>
          </span>
        </button>
      )}

      <div className={`connect-controls ${showControls ? "show" : ""}`} onPointerMove={keepControlsVisible} onPointerDown={keepControlsVisible}>
        <div className="cc-above-progress">
          <span className="cc-left-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <button type="button" className="cc-icon apple-full" onClick={() => { keepControlsVisible(); onToggleFullscreen(); }} aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isFullScreen ? (
                <><path d="M9 4v5H4" /><path d="M4 4l6 6" /><path d="M15 4v5h5" /><path d="M20 4l-6 6" /><path d="M9 20v-5H4" /><path d="M4 20l6-6" /><path d="M15 20v-5h5" /><path d="M20 20l-6-6" /></>
              ) : (
                <><path d="M4 9V4h5" /><path d="M4 4l6 6" /><path d="M20 9V4h-5" /><path d="M20 4l-6 6" /><path d="M4 15v5h5" /><path d="M4 20l6-6" /><path d="M20 15v5h-5" /><path d="M20 20l-6-6" /></>
              )}
            </svg>
          </button>
        </div>
        <div className="cc-progress-bottom">
          <div className="starz-progress" onPointerDown={(e) => { keepControlsVisible(); const bg = e.currentTarget.querySelector(".starz-progress-bg") as HTMLElement | null; if (bg) { onSeek(e.clientX, bg.getBoundingClientRect()); } }}>
            <div className="starz-progress-bg">
              <div className="starz-buffered" style={{ width: `${bufferedProgress}%` }} />
              <div className="starz-progress-fill" style={{ width: `${progress}%` }} />
              <div className="starz-thumb" style={{ left: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

