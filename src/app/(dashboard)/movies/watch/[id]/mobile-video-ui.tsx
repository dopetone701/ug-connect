"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import "./mobile-full.css"
import SimilarMovies from "./similar-movies"

export default function MobileVideoUI({ movie }: any) {
  const router = useRouter()
  const searchParams = useSearchParams()

  /*
   * IMPORTANT
   * -----------------------------------------
   * This FULL player has its OWN video element.
   *
   * Do NOT use usesingleplayer() here.
   *
   * MobilePreview owns preview playback.
   * MobileVideoUI owns full movie playback.
   *
   * This prevents preview_urls and video_url
   * from fighting over the same global ref.
   */
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isFull, setIsFull] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [showPlay, setShowPlay] = useState(false)
  const [progress, setProgress] = useState(0)

  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  const [showVol, setShowVol] = useState(false)
  const [volPct, setVolPct] = useState(100)

  const [descOpen, setDescOpen] = useState(false)

  const touchStartY = useRef(0)
  const touchStartVol = useRef(1)
  const volTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  /*
   * URL MODE
   *
   * ?t=full     = full movie mode
   * ?t=preview  = preview mode
   *
   * The parent/page can therefore open this component
   * from anywhere in the application.
   */
  useEffect(() => {
    const mode = searchParams.get("t")

    if (mode === "full") {
      setIsFull(true)
    } else {
      setIsFull(false)
    }
  }, [searchParams])

  /*
   * FULL MOVIE LOADING
   * -----------------------------------------
   * video_url is ONLY used here.
   *
   * MobilePreview never reaches this player.
   */
  useEffect(() => {
    const video = videoRef.current

    if (!video || !movie?.video_url) return

    /*
     * Always stop the current source before loading
     * another movie.
     */
    video.pause()

    /*
     * Full movie source.
     */
    if (video.src !== movie.video_url) {
      video.src = movie.video_url
    }

    video.volume = isMuted ? 0 : volume
    video.load()

    /*
     * Try autoplay.
     *
     * Browsers may block unmuted autoplay.
     * User can tap the video to start it.
     */
    const start = async () => {
      try {
        await video.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
      }
    }

    start()

    /*
     * Stop every other video/audio in the application.
     *
     * This prevents a preview/reel/background player
     * from continuing underneath the full player.
     */
    document.querySelectorAll("video").forEach((v) => {
      if (v !== video) {
        try {
          v.pause()
        } catch {}
      }
    })

    document.querySelectorAll("audio").forEach((audio) => {
      try {
        audio.pause()
      } catch {}
    })

    return () => {
      if (volTimeout.current) {
        clearTimeout(volTimeout.current)
      }

      if (playTimeout.current) {
        clearTimeout(playTimeout.current)
      }

      /*
       * Do not keep the full movie playing when this
       * component disappears.
       */
      try {
        video.pause()
      } catch {}
    }
  }, [movie?.id, movie?.video_url])

  /*
   * FULLSCREEN / LANDSCAPE SHELL
   * -----------------------------------------
   * When ?t=full:
   *
   * - hide app navigation
   * - lock body scrolling
   * - lock orientation to landscape
   *
   * When leaving full:
   *
   * - restore navigation
   * - restore body
   * - unlock orientation
   */
  useEffect(() => {
    const shellEls = document.querySelectorAll(
      'nav, aside, [data-shell], [class*="sidebar"], [class*="bottom-nav"], [class*="tab-bar"]'
    )

    const showShell = () => {
      document.body.style.overflow = ""

      shellEls.forEach((el: Element) => {
        const element = el as HTMLElement

        element.style.display = ""
        element.style.visibility = ""
        element.style.opacity = ""
        element.style.pointerEvents = ""
      })

      try {
        if (screen.orientation?.unlock) {
          screen.orientation.unlock()
        }
      } catch {}
    }

    const hideShell = async () => {
      document.body.style.overflow = "hidden"

      shellEls.forEach((el: Element) => {
        const element = el as HTMLElement

        element.style.display = "none"
      })

      /*
       * Try the native orientation API.
       *
       * iOS Safari may reject this depending on the
       * browser/PWA environment, so it must never break
       * the player if it fails.
       */
      try {
        if (screen.orientation?.lock) {
          await screen.orientation.lock("landscape")
        }
      } catch {}
    }

    if (isFull) {
      hideShell()
    } else {
      showShell()
    }

    return () => {
      showShell()
    }
  }, [isFull])

  /*
   * Volume synchronization.
   */
  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    video.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  /*
   * PLAY / PAUSE
   */
  const togglePlay = () => {
    const video = videoRef.current

    if (!video) return

    if (video.paused) {
      video
        .play()
        .then(() => {
          setPlaying(true)
        })
        .catch(() => {})
    } else {
      video.pause()
      setPlaying(false)
    }

    setShowPlay(true)

    if (playTimeout.current) {
      clearTimeout(playTimeout.current)
    }

    playTimeout.current = setTimeout(() => {
      setShowPlay(false)
    }, 800)
  }

  /*
   * PROGRESS
   */
  const onTimeUpdate = () => {
    const video = videoRef.current

    if (!video) return

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0
    ) {
      const pct =
        (video.currentTime / video.duration) * 100

      setProgress(Math.max(0, Math.min(100, pct)))
    }
  }

  /*
   * VOLUME GESTURE START
   *
   * Swipe vertically on the left side.
   */
  const onTouchStart = (e: React.TouchEvent) => {
    const rect = (
      e.currentTarget as HTMLElement
    ).getBoundingClientRect()

    const touch = e.touches[0]

    if (!touch) return

    const x = touch.clientX - rect.left

    /*
     * Left 45% of player = volume gesture.
     */
    if (x < rect.width * 0.45) {
      touchStartY.current = touch.clientY

      touchStartVol.current = isMuted
        ? 0
        : volume

      setShowVol(true)

      if (volTimeout.current) {
        clearTimeout(volTimeout.current)
      }
    }
  }

  /*
   * VOLUME GESTURE MOVE
   */
  const onTouchMove = (e: React.TouchEvent) => {
    const rect = (
      e.currentTarget as HTMLElement
    ).getBoundingClientRect()

    const touch = e.touches[0]

    if (!touch) return

    const x = touch.clientX - rect.left

    if (
      x < rect.width * 0.45 &&
      showVol
    ) {
      const dy =
        touchStartY.current -
        touch.clientY

      const delta =
        dy / rect.height

      const newVol = Math.max(
        0,
        Math.min(
          1,
          touchStartVol.current + delta
        )
      )

      setVolume(newVol)

      setVolPct(
        Math.round(newVol * 100)
      )

      setIsMuted(newVol === 0)

      if (volTimeout.current) {
        clearTimeout(volTimeout.current)
      }

      volTimeout.current = setTimeout(() => {
        setShowVol(false)
      }, 1200)
    }
  }

  /*
   * VOLUME GESTURE END
   */
  const onTouchEnd = () => {
    if (!showVol) return

    if (volTimeout.current) {
      clearTimeout(volTimeout.current)
    }

    volTimeout.current = setTimeout(() => {
      setShowVol(false)
    }, 1000)
  }

  /*
   * MUTE
   */
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isMuted || volume === 0) {
      const restored =
        volPct > 0
          ? volPct / 100
          : 0.5

      setVolume(restored)
      setVolPct(
        volPct > 0
          ? volPct
          : 50
      )

      setIsMuted(false)
    } else {
      setIsMuted(true)
    }

    setShowVol(true)

    if (volTimeout.current) {
      clearTimeout(volTimeout.current)
    }

    volTimeout.current = setTimeout(() => {
      setShowVol(false)
    }, 1000)
  }

  /*
   * ENTER FULL MODE
   *
   * We update the URL rather than only changing local
   * state. This means the full player can be opened from
   * any page and the URL remains shareable/direct.
   */
  const enterFull = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation()

    setIsFull(true)

    router.replace(
      `/movies/watch/${movie.id}?t=full`
    )
  }

  /*
   * EXIT FULL MODE
   *
   * We return to the normal movie page.
   *
   * If you have a specific previous route,
   * replace this with router.back().
   */
  const exitFull = (
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation()

    setIsFull(false)

    const video = videoRef.current

    if (video) {
      /*
       * Keep playback state predictable when leaving
       * landscape mode.
       */
      video.pause()
      setPlaying(false)
    }

    router.replace(
      `/movies/watch/${movie.id}`
    )
  }

  /*
   * GO TO PREVIEW
   *
   * IMPORTANT:
   * Do NOT call usesingleplayer() here.
   *
   * MobilePreview owns preview playback.
   */
  const openPreview = (
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation()

    const video = videoRef.current

    if (video) {
      video.pause()
    }

    setPlaying(false)

    router.push(
      `/movies/watch/${movie.id}?t=preview`
    )
  }

  /*
   * SHARE
   */
  const shareMovie = async (
    e: React.MouseEvent
  ) => {
    e.stopPropagation()

    const url = window.location.href

    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title: movie.title,
          url,
        })
      } else if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(url)
      }
    } catch {
      /*
       * User cancelled share sheet.
       */
    }
  }

  if (!movie) {
    return null
  }

  return (
    <div
      className={[
        "mob-full-root",
        isFull
          ? "mode-landscape"
          : "mode-youtube",
        "slide-in-left",
      ].join(" ")}
    >

      {/* =========================================
          FULL MODE CLOSE BUTTON
         ========================================= */}
      {isFull && (
        <button
          className="mob-close-x"
          onClick={exitFull}
          aria-label="Close full screen"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 6l12 12" />
            <path d="M18 6L6 18" />
          </svg>
        </button>
      )}

      {/* =========================================
          VIDEO
         ========================================= */}
      <div
        className="mob-full-video-wrap"
        onClick={togglePlay}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        <video
          ref={videoRef}
          src={movie.video_url || undefined}
          poster={
            movie.cover_url ||
            movie.cover ||
            undefined
          }
          autoPlay
          playsInline
          controls={false}
          preload="auto"
          className="mob-full-video"
          onTimeUpdate={onTimeUpdate}
          onPlay={() => {
            setPlaying(true)
          }}
          onPause={() => {
            setPlaying(false)
          }}
          onEnded={() => {
            setPlaying(false)
            setProgress(100)
          }}
        />

        {/* =====================================
            VOLUME COUNTER
           ===================================== */}
        {showVol && (
          <div className="mob-vol-counter">

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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

            <span>
              {isMuted
                ? 0
                : volPct}
              %
            </span>

          </div>
        )}

        {/* =====================================
            PORTRAIT TOP BAR
           ===================================== */}
        {!isFull && (
          <div className="mob-yt-topbar">

            {/* MUTE */}
            <button
              className="mob-yt-icon"
              onClick={toggleMute}
              aria-label={
                isMuted
                  ? "Unmute"
                  : "Mute"
              }
            >
              {isMuted ||
              volPct === 0 ? (
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
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line
                    x1="23"
                    y1="9"
                    x2="17"
                    y2="15"
                  />
                  <line
                    x1="17"
                    y1="9"
                    x2="23"
                    y2="15"
                  />
                </svg>
              ) : (
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
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>

            {/* FULLSCREEN */}
            <button
              className="mob-yt-icon"
              onClick={enterFull}
              aria-label="Full screen"
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
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            </button>

          </div>
        )}

        {/* =====================================
            PLAY / PAUSE FEEDBACK
           ===================================== */}
        {showPlay && (
          <div className="apple-play-pure">

            {!playing ? (
              <svg
                viewBox="0 0 24 24"
                width="64"
                height="64"
                fill="white"
                style={{
                  filter:
                    "drop-shadow(0 2px 8px rgba(0,0,0,.6))",
                }}
              >
                <path d="M8 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="64"
                height="64"
                fill="white"
                style={{
                  filter:
                    "drop-shadow(0 2px 8px rgba(0,0,0,.6))",
                }}
              >
                <rect
                  x="7"
                  y="5"
                  width="3.5"
                  height="14"
                  rx="1"
                />
                <rect
                  x="13.5"
                  y="5"
                  width="3.5"
                  height="14"
                  rx="1"
                />
              </svg>
            )}

          </div>
        )}

        {/* =====================================
            PROGRESS
           ===================================== */}
        <div className="mob-progress-track">
          <div
            className="mob-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

      </div>

      {/* =========================================
          PORTRAIT ACTIONS
         ========================================= */}
      {!isFull && (
        <div className="mob-yt-actions-under">

          <button
            onClick={openPreview}
            className="btn-preview"
          >
            ▶ Play Preview
          </button>

          <button
            className="btn-share"
            onClick={shareMovie}
          >
            Share
          </button>

          <button
            className="btn-list"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            + My List
          </button>

        </div>
      )}

      {/* =========================================
          FULL MODE ACTIONS
         ========================================= */}
      {isFull && (
        <div className="mob-full-btns">

          <button
            onClick={openPreview}
            className="btn-preview"
          >
            ▶ Play Preview
          </button>

          <button
            className="btn-share"
            onClick={shareMovie}
          >
            Share
          </button>

          <button
            className="btn-list"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            + My List
          </button>

        </div>
      )}

      {/* =========================================
          MOVIE INFORMATION
         ========================================= */}
      <div className="mob-full-body">

        <div className="mob-yt-handle" />

        <h2>
          {movie.title}
        </h2>

        {/* DESCRIPTION */}
        <div className="mob-desc-wrap">

          <p
            className={[
              "mob-full-desc",
              !descOpen
                ? "clamped"
                : "",
            ].join(" ")}
          >
            {movie.description}
          </p>

          {!descOpen &&
            movie.description?.length >
              200 && (
              <button
                className="mob-desc-more"
                onClick={() =>
                  setDescOpen(true)
                }
              >
                ...
                <span>
                  more
                </span>

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            )}

          {descOpen && (
            <button
              className="mob-desc-more"
              onClick={() =>
                setDescOpen(false)
              }
            >
              less

              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
          )}

        </div>

        {/* =====================================
            SIMILAR MOVIES
           ===================================== */}
        <SimilarMovies
          current={movie}
        />

      </div>

    </div>
  )
}
