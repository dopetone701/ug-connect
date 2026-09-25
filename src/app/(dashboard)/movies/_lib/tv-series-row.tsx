"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWatchDrawer } from "@/stores/use-watch-drawer"
import { useMovieStore } from "../../../../stores/use-movie-store"

import "./series-row.css"

// Surgical: only render episode cards when scrolled into view
function useVisible(ref: React.RefObject<HTMLDivElement | null>) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true)
          ob.disconnect()
        }
      },
      { rootMargin: "400px" }
    )

    ob.observe(ref.current)

    return () => ob.disconnect()
  }, [ref])

  return show
}

function SeriesCard({ m }: { m: any }) {
  const router = useRouter()

  const cardRef = useRef<HTMLDivElement>(null)

  const isVisible = useVisible(cardRef)

  const { openDrawer } = useWatchDrawer()
  const { addRecent } = useMovieStore() as any

  const seasons = m.seasons || []

  const episodes = seasons.flatMap(
    (s: any) => s.episodes || []
  )

  const seasonLabel =
    seasons.length > 1
      ? `S1-S${seasons.length}`
      : seasons[0]?.name
        ? seasons[0].name.slice(0, 4)
        : "S1"

  /*
   * Open the series.
   *
   * Desktop:
   * Connect Player
   *
   * Mobile:
   * Watch Drawer
   */
  const open = (epId?: string) => {
    const id = String(m.id)

    addRecent(id)

    try {
      sessionStorage.setItem(
        `movie_preload_${id}`,
        JSON.stringify({
          id,
          ep: epId || null,
        })
      )
    } catch {}

    /*
     * Desktop -> Connect Player
     */
    if (
      typeof window !== "undefined" &&
      window.innerWidth > 768
    ) {
      const query = epId
        ? `?t=full&ep=${encodeURIComponent(
            String(epId)
          )}`
        : "?t=full"

      router.push(
        `/movies/watch/${id}${query}`
      )

      return
    }

    /*
     * Mobile -> existing Watch Drawer
     */
    openDrawer(id, "full" as any)
  }

  /*
   * Make the episode mini-card keyboard accessible.
   */
  const handleEpisodeKeyDown = (
    e: React.KeyboardEvent,
    epId: string
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      e.stopPropagation()
      open(epId)
    }
  }

  return (
    <div
      className="series-big-card"
      ref={cardRef}
    >
      <div
        className="series-cover-wrap"
        role="button"
        tabIndex={0}
        onClick={() => open()}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" ||
            e.key === " "
          ) {
            e.preventDefault()
            open()
          }
        }}
      >
        <img
          src={
            m.cover_url ||
            m.cover
          }
          alt={m.title}
          draggable={false}
          loading="lazy"
          decoding="async"
        />

        <div className="series-dark" />

        <div className="series-top-row">
          <div className="series-vj">
            {m.vj || "VJ Junior"}
          </div>

          <div className="series-season">
            {seasonLabel}
          </div>
        </div>

        <div className="series-big-title">
          {m.title}
        </div>
      </div>

      <div className="s-ep-track">
        {isVisible ? (
          episodes.length > 0 ? (
            episodes
              .slice(0, 10)
              .map(
                (
                  ep: any,
                  i: number
                ) => (
                  <div
                    key={ep.id}
                    className="s-ep-mini-card"
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()

                      open(
                        String(ep.id)
                      )
                    }}
                    onKeyDown={(e) =>
                      handleEpisodeKeyDown(
                        e,
                        String(ep.id)
                      )
                    }
                  >
                    <div className="s-ep-mini-cover">
                      <img
                        src={
                          ep.preview_url ||
                          ep.cover_url ||
                          m.cover_url ||
                          m.cover
                        }
                        alt={
                          ep.title ||
                          `Ep ${i + 1}`
                        }
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                      />

                      <div className="s-ep-fade" />
                    </div>

                    <div className="s-ep-title">
                      {ep.title ||
                        `Ep ${i + 1}`}
                    </div>
                  </div>
                )
              )
          ) : (
            <div className="s-no-ep">
              No episodes
            </div>
          )
        ) : (
          <div className="s-no-ep">
            ...
          </div>
        )}
      </div>
    </div>
  )
}

export default function TvSeriesRow({
  movies,
  onSeeAll,
}: {
  movies: any[]
  onSeeAll?: (v: string) => void
}) {
  const trackRef =
    useRef<HTMLDivElement>(null)

  /*
   * Arrow scrolling
   */
  const scroll = (
    dir: "left" | "right"
  ) => {
    if (!trackRef.current) return

    trackRef.current.scrollBy({
      left:
        dir === "left"
          ? -360
          : 360,
      behavior: "smooth",
    })
  }

  /*
   * Mouse-wheel scrolling on PC.
   *
   * Converts the normal vertical
   * mouse wheel into horizontal
   * scrolling only when the series
   * track can actually scroll.
   *
   * Touch/swipe behavior is untouched.
   */
  const handleWheel = (
    e: React.WheelEvent<HTMLDivElement>
  ) => {
    const track =
      trackRef.current

    if (!track) return

    /*
     * Do not hijack the wheel when
     * there is nothing to scroll.
     */
    if (
      track.scrollWidth <=
      track.clientWidth
    ) {
      return
    }

    /*
     * Shift/trackpad horizontal
     * scrolling already comes through
     * deltaX, while a normal mouse
     * wheel uses deltaY.
     */
    const delta =
      Math.abs(e.deltaX) >
      Math.abs(e.deltaY)
        ? e.deltaX
        : e.deltaY

    if (!delta) return

    const maxScroll =
      track.scrollWidth -
      track.clientWidth

    const current =
      track.scrollLeft

    /*
     * Only prevent the page from
     * scrolling while the horizontal
     * series track can consume the
     * wheel movement.
     */
    const movingRight =
      delta > 0

    const movingLeft =
      delta < 0

    const canMoveRight =
      current < maxScroll - 1

    const canMoveLeft =
      current > 1

    if (
      (movingRight &&
        canMoveRight) ||
      (movingLeft &&
        canMoveLeft)
    ) {
      e.preventDefault()

      track.scrollBy({
        left: delta,
        behavior: "auto",
      })
    }
  }

  if (!movies?.length) {
    return null
  }

  return (
    <div className="series-root">
      <div className="series-head">
        <h3
          className="series-title"
          onClick={() =>
            onSeeAll?.(
              "tv series"
            )
          }
        >
          TV Series
        </h3>

        <button
          className="series-see"
          onClick={() =>
            onSeeAll?.(
              "tv series"
            )
          }
        >
          SEE ALL
        </button>
      </div>

      <div className="series-track-wrap">
        <button
          className="s-arrow left"
          onClick={() =>
            scroll("left")
          }
          aria-label="scroll left"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          className="s-arrow right"
          onClick={() =>
            scroll("right")
          }
          aria-label="scroll right"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <div
          className="series-track"
          ref={trackRef}
          onWheel={handleWheel}
        >
          {movies.map(
            (m: any) => (
              <SeriesCard
                key={m.id}
                m={m}
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}
