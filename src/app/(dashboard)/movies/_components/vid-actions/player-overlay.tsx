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
      {/* EXPAND - LEFT */}
      <button
        className="bubble-expand"
        style={{ pointerEvents: "auto" }}
        onClick={(e) => {
          e.stopPropagation();
          (onExpand || onToggleFullscreen)?.();
        }}
        aria-label="Expand"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </button>

      {/* CLOSE - RIGHT */}
      <button
        className="bubble-close"
        style={{ pointerEvents: "auto" }}
        onClick={(e) => {
          e.stopPropagation();
          (onClose || onBack)?.();
        }}
        aria-label="Close"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M1 1L11 11M11 1L1 11" />
        </svg>
      </button>
    </div>
  );
}



  return (
    <>
      {/* TOP BAR */}
      <div className={`center-top ${showControls ? "show" : ""}`}>
        <div className="top-left">
          <BackBtn
            onClick={() => {
              keepControlsVisible();
              onBack();
            }}
            className="w-8 h-8 mr-1"
          />

          <div className="top-pills">
            <span className="c-pill">{movie?.vj}</span>
          </div>
        </div>

        <div className="fullscreen-logo top-right">
          <img src="/logo.png" alt="logo" />
        </div>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="connect-loader">
          <div className="connect-spinner" />
        </div>
      )}

      {/* CENTER PLAY BUTTON */}
      {!playing && !isLoading && (
        <button
          type="button"
          className="play-apple"
          onClick={() => {
            keepControlsVisible();
            onTogglePlay();
          }}
          aria-label="Play"
        >
          <span className="play-apple-core">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8.2 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z"
                fill="white"
              />
            </svg>
          </span>
        </button>
      )}

      {/* PLAYER CONTROLS */}
      <div
        className={`connect-controls ${showControls ? "show" : ""}`}
        onPointerMove={keepControlsVisible}
        onPointerDown={keepControlsVisible}
      >
        {/* TIME + FULLSCREEN */}
        <div className="cc-above-progress">
          <span className="cc-left-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button
            type="button"
            className="cc-icon apple-full"
            onClick={() => {
              keepControlsVisible();
              onToggleFullscreen();
            }}
            aria-label={
              isFullScreen ? "Exit fullscreen" : "Enter fullscreen"
            }
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {isFullScreen ? (
                <>
                  <path d="M9 4v5H4" />
                  <path d="M4 4l6 6" />
                  <path d="M15 4v5h5" />
                  <path d="M20 4l-6 6" />
                  <path d="M9 20v-5H4" />
                  <path d="M4 20l6-6" />
                  <path d="M15 20v-5h5" />
                  <path d="M20 20l-6-6" />
                </>
              ) : (
                <>
                  <path d="M4 9V4h5" />
                  <path d="M4 4l6 6" />
                  <path d="M20 9V4h-5" />
                  <path d="M20 4l-6 6" />
                  <path d="M4 15v5h5" />
                  <path d="M4 20l6-6" />
                  <path d="M20 15v5h-5" />
                  <path d="M20 20l-6-6" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* PROGRESS */}
        <div className="cc-progress-bottom">
          <div
            className="starz-progress"
            onPointerDown={(e) => {
              keepControlsVisible();

              const bg = e.currentTarget.querySelector(
                ".starz-progress-bg"
              ) as HTMLElement | null;

              if (bg) {
                onSeek(
                  e.clientX,
                  bg.getBoundingClientRect()
                );
              }
            }}
          >
            <div className="starz-progress-bg">
              <div
                className="starz-buffered"
                style={{
                  width: `${bufferedProgress}%`,
                }}
              />

              <div
                className="starz-progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />

              <div
                className="starz-thumb"
                style={{
                  left: `${progress}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
