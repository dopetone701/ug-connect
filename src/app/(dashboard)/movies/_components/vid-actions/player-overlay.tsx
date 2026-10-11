"use client";

import BackBtn from "../back-btn";
import PlayBtnIcon from "./../../../../../modal-generator/svg-icons/play-btn-icon";
import Reverse10Icon from "./../../../../../modal-generator/svg-icons/minus-10-revolve-icon";
import Replay10Icon from "./../../../../../modal-generator/svg-icons/plus-10-revolve-icon";
import QualitySettings from "./quality-settings";
import "./setting-gear.css";

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
  onSkip,
  onBack,
  onShowControls,
  onInteractionStart,
  onInteractionEnd,
  onClose,
  onExpand,
  isMini = false,
}: any) {
  const keepControlsVisible = () => {
    onShowControls?.();
  };

  const startInteraction = () => {
    onInteractionStart?.();
    keepControlsVisible();
  };

  const endInteraction = () => {
    onInteractionEnd?.();
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
          type="button"
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

        <button
          type="button"
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

  const skipButtonStyle = {
    position: "absolute" as const,
    top: "50%",
    width: "56px",
    height: "56px",
    padding: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 9999,
    transform: "translate(-50%, -50%)",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation" as const,
    pointerEvents: "auto" as const,
  };

  return (
    <>
      {/* BACK / MINIMIZE */}
      {!isFullScreen && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            zIndex: 10000,
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
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          ) : (
            <BackBtn
              onClick={() => {
                keepControlsVisible();
                onBack?.();
              }}
              className="w-8 h-8 mr-1"
            />
          )}
        </div>
      )}

      {/* TOP BAR */}
      <div
        className={`center-top ${showControls ? "show" : ""}`}
        style={{ pointerEvents: showControls ? "auto" : "none" }}
      >
        <div
          className="top-left"
          style={{
            marginLeft: isMobile && !isFullScreen ? "52px" : "0",
          }}
        >
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

      {/* REWIND 10 */}
      {showControls && !isLoading && (
        <button
          type="button"
          aria-label="Rewind 10 seconds"
          title="Rewind 10 seconds"
          style={{
            ...skipButtonStyle,
            left: "calc(50% - 100px)",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            startInteraction();
          }}
          onPointerUp={endInteraction}
          onPointerCancel={endInteraction}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            keepControlsVisible();
            onSkip?.(-10);
          }}
        >
          <Reverse10Icon />
        </button>
      )}

      {/* CENTRAL PLAY / PAUSE */}
      {showControls && !isLoading && (
        <button
          type="button"
          className="play-apple"
          onPointerDown={(e) => {
            e.stopPropagation();
            startInteraction();
          }}
          onPointerUp={endInteraction}
          onPointerCancel={endInteraction}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            keepControlsVisible();
            onTogglePlay?.();
          }}
          aria-label={playing ? "Pause" : "Play"}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10001,
            pointerEvents: "auto",
            touchAction: "manipulation",
          }}
        >
          <span className="play-apple-core">
            <PlayBtnIcon playing={playing} size={64} />
          </span>
        </button>
      )}

      {/* FORWARD 10 */}
      {showControls && !isLoading && (
        <button
          type="button"
          aria-label="Forward 10 seconds"
          title="Forward 10 seconds"
          style={{
            ...skipButtonStyle,
            left: "calc(50% + 100px)",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            startInteraction();
          }}
          onPointerUp={endInteraction}
          onPointerCancel={endInteraction}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            keepControlsVisible();
            onSkip?.(10);
          }}
        >
          <Replay10Icon />
        </button>
      )}

      {/* PLAYER CONTROLS */}
      <div
        className={`connect-controls ${showControls ? "show" : ""}`}
        style={{ pointerEvents: showControls ? "auto" : "none" }}
        onPointerMove={keepControlsVisible}
      >
        <div className="cc-above-progress">
          <span className="cc-left-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* RIGHT-SIDE CONTROLS: SETTINGS THEN FULLSCREEN */}
          <div className="cc-right-simple">
            <QualitySettings />

            <button
              type="button"
              className="cc-icon apple-full"
              onPointerDown={startInteraction}
              onPointerUp={endInteraction}
              onPointerCancel={endInteraction}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                keepControlsVisible();
                onToggleFullscreen?.();
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
        </div>

        {/* DRAGGABLE PROGRESS BAR */}
        <div className="cc-progress-bottom">
          <div
            className="starz-progress"
            style={{
              touchAction: "none",
              cursor: "pointer",
              pointerEvents: "auto",
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();

              startInteraction();

              const bar = e.currentTarget;
              bar.setPointerCapture(e.pointerId);

              const seekFromPointer = (clientX: number) => {
                const bg = bar.querySelector(
                  ".starz-progress-bg"
                ) as HTMLElement | null;

                if (!bg) return;

                onSeek?.(clientX, bg.getBoundingClientRect());
              };

              seekFromPointer(e.clientX);

              const handlePointerMove = (event: PointerEvent) => {
                seekFromPointer(event.clientX);
              };

              const handlePointerUp = () => {
                bar.removeEventListener("pointermove", handlePointerMove);
                bar.removeEventListener("pointerup", handlePointerUp);
                bar.removeEventListener("pointercancel", handlePointerUp);
                endInteraction();
              };

              bar.addEventListener("pointermove", handlePointerMove);
              bar.addEventListener("pointerup", handlePointerUp);
              bar.addEventListener("pointercancel", handlePointerUp);
            }}
          >
            <div className="starz-progress-bg">
              <div
                className="starz-buffered"
                style={{ width: `${bufferedProgress}%` }}
              />
              <div
                className="starz-progress-fill"
                style={{ width: `${progress}%` }}
              />
              <div
                className="starz-thumb"
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
