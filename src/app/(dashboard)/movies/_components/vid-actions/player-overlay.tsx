"use client";

import BackBtn from "../back-btn";
import PlayBtnIcon from "./../../../../../modal-generator/svg-icons/play-btn-icon";
import Reverse10Icon from "./../../../../../modal-generator/svg-icons/minus-10-revolve-icon";
import Replay10Icon from "./../../../../../modal-generator/svg-icons/plus-10-revolve-icon";
import QualitySettings from "./quality-settings";
import NextMovie from "./next-movie";

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
  onQualityChange,
  onClose,
  onExpand,
  isMini = false,
  // next movie logic - added
  currentEpisodeIndex = 0,
  episodes = [],
  isSeries = false,
  autoPlayOn = false,
  onNextEpisode,
  onPrevEpisode,
  setAutoPlayOn,
}: any) {
  const keepControlsVisible = () => onShowControls?.();
  const startInteraction = () => {
    onInteractionStart?.();
    keepControlsVisible();
  };
  const endInteraction = () => onInteractionEnd?.();

  if (isMini) {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 100, pointerEvents: "none" }}>
        <button
          type="button"
          className="bubble-expand"
          style={{ pointerEvents: "auto" }}
          onClick={(e) => {
            e.stopPropagation();
            (onExpand || onToggleFullscreen)?.();
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
        </button>
        <button
          type="button"
          className="bubble-close"
          style={{ pointerEvents: "auto" }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBack?.();
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.5"><path d="M1 1L11 11M11 1L1 11" /></svg>
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
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 9999,
    transform: "translate(-50%, -50%)",
    pointerEvents: "auto" as const,
  } as const;

  return (
    <>
      {!isFullScreen && (
        <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 10000, pointerEvents: "auto" }}>
          {isMobile ? (
            <button
              type="button"
              onPointerUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBack?.();
              }}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white border border-white/10"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
            </button>
          ) : (
            <BackBtn onClick={() => onBack?.()} className="w-8 h-8 mr-1" />
          )}
        </div>
      )}

      <div className={`center-top ${showControls ? "show" : ""}`} style={{ pointerEvents: showControls ? "auto" : "none" }}>
        <div className="top-left" style={{ marginLeft: isMobile && !isFullScreen ? "52px" : "0" }}>
          <div className="top-pills"><span className="c-pill">{movie?.vj}</span></div>
        </div>
        <div className="fullscreen-logo top-right"><img src="/logo.png" alt="logo" /></div>
      </div>

      {isLoading && (
        <div className="connect-loader"><div className="connect-spinner" /></div>
      )}

      {showControls && !isLoading && (
        <>
          <button type="button" style={{ ...skipButtonStyle, left: "calc(50% - 100px)" }} onClick={(e) => { e.stopPropagation(); onSkip?.(-10); }}><Reverse10Icon /></button>
          <button type="button" className="play-apple" onClick={(e) => { e.stopPropagation(); onTogglePlay?.(); }} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10001 }}>
            <span className="play-apple-core"><PlayBtnIcon playing={playing} size={64} /></span>
          </button>
          <button type="button" style={{ ...skipButtonStyle, left: "calc(50% + 100px)" }} onClick={(e) => { e.stopPropagation(); onSkip?.(10); }}><Replay10Icon /></button>
        </>
      )}

      <div className={`connect-controls ${showControls ? "show" : ""}`} style={{ pointerEvents: showControls ? "auto" : "none" }} onPointerMove={keepControlsVisible}>
        <div className="cc-above-progress">
          <span className="cc-left-time">{formatTime(currentTime)} / {formatTime(duration)}</span>

          <div className="cc-right-simple" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* NEXT/PREV + AUTOPLAY - injected safely */}
            <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
              <NextMovie
                currentIndex={currentEpisodeIndex}
                total={episodes?.length || 0}
                isSeries={isSeries}
                autoPlayOn={autoPlayOn}
                onNext={onNextEpisode}
                onPrev={onPrevEpisode}
                onToggleAutoPlay={setAutoPlayOn}
              />
            </div>

            <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
              {/* @ts-ignore */}
              <QualitySettings onQualityChange={onQualityChange} />
            </div>

            <button type="button" className="cc-icon apple-full" onClick={(e) => { e.stopPropagation(); onToggleFullscreen?.(); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d={isFullScreen ? "M9 4v5H4M4 4l6 6M15 4v5h5M20 4l-6 6M9 20v-5H4M4 20l6-6M15 20v-5h5M20 20l-6-6" : "M4 9V4h5M4 4l6 6M20 9V4h-5M20 4l-6 6M4 15v5h5M4 20l6-6M20 15v5h-5M20 20l-6-6"} /></svg>
            </button>
          </div>
        </div>

        <div className="cc-progress-bottom">
          <div className="starz-progress" style={{ touchAction: "none", cursor: "pointer" }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              startInteraction();
              const bar = e.currentTarget;
              bar.setPointerCapture(e.pointerId);
              const seekFromPointer = (clientX: number) => {
                const bg = bar.querySelector(".starz-progress-bg") as HTMLElement | null;
                if (!bg) return;
                onSeek?.(clientX, bg.getBoundingClientRect());
              };
              seekFromPointer(e.clientX);
              const handleMove = (ev: PointerEvent) => seekFromPointer(ev.clientX);
              const handleUp = () => {
                bar.removeEventListener("pointermove", handleMove);
                bar.removeEventListener("pointerup", handleUp);
                bar.removeEventListener("pointercancel", handleUp);
                endInteraction();
              };
              bar.addEventListener("pointermove", handleMove);
              bar.addEventListener("pointerup", handleUp);
              bar.addEventListener("pointercancel", handleUp);
            }}
          >
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

