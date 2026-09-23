"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMovieStore } from "./use-movie-store"
import { useWatchDrawer } from "@/stores/use-watch-drawer"
import "./series-row.css"

function useVisible(ref: React.RefObject<HTMLDivElement | null>) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true)
          ob.disconnect()
        }
      },
      {
        rootMargin: "400px",
      }
    )

    ob.observe(ref.current)

    return () => ob.disconnect()
  }, [])

  return show
}

function MiniCard({ m }: { m: any }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isVisible = useVisible(cardRef)
  const router = useRouter()

  const { addRecent } = useMovieStore() as any
  const { openDrawer } = useWatchDrawer() as any

  const dragRef = useRef(false)

  const seasons = m.seasons || []

  const parts = seasons
    .flatMap((s: any) => s.episodes || [])
    .slice(0, 10)

  const seasonLabel =
    seasons.length > 1 ? `S1-S${seasons.length}` : "S1"

  const fallbackCover =
    m.cover_url || m.cover || "/placeholder.png"

  const getPartTitle = (part: any, i: number) => {
    if (!part.title) {
      return `Part ${i + 1}`
    }

    return part.title.replace(/episode/gi, "Part")
  }

  const openMovie = (epId?: string | number) => {
    if (dragRef.current) return

    const id = String(m.id)

    addRecent(id)

    try {
      const panel = document.querySelector(
        ".content-panel"
      ) as HTMLElement | null

      if (panel) {
        sessionStorage.setItem(
          "movies_home_scroll_v1",
          String(panel.scrollTop)
        )
      } else {
        sessionStorage.setItem(
          "movies_home_scroll_v1",
          String(window.scrollY)
        )
      }

      sessionStorage.setItem(
        `movie_preload_${id}`,
        JSON.stringify({
          id,
          title: m.title,
          cover_url: m.cover_url || m.cover,
          video_url: (m as any).video_url || (m as any).video,
          genre: m.genre,
          vj: m.vj,
          description: (m as any).desc,
          ep: epId ? String(epId) : null,
        })
      )
    } catch {}

    const epQ = epId ? `&ep=${epId}` : ""

    if (
      typeof window !== "undefined" &&
      window.innerWidth > 768
    ) {
      router.push(
        `/movies/watch/${id}?t=full${epQ}`
      )

      return
    }

    openDrawer(
      id,
      "full",
      epId ? String(epId) : undefined
    )
  }

  return (
    <div
      className="series-big-card rectangle"
      ref={cardRef}
    >
      <div
        className="series-cover-wrap"
        role="button"
        tabIndex={0}
        onPointerDown={() => {
          dragRef.current = false
        }}
        onClick={() => openMovie()}
      >
        <img
          src={fallbackCover}
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
          parts.length > 0 ? (
            parts.map((part: any, i: number) => (
              <div
                key={part.id || i}
                className="s-ep-mini-card"
                role="button"
                tabIndex={0}
                onClick={() =>
                  openMovie(part.id || i)
                }
              >
                <div className="s-ep-mini-cover">
                  <img
                    src={
                      part.preview_url ||
                      part.cover_url ||
                      fallbackCover
                    }
                    alt={getPartTitle(part, i)}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />

                  <div className="s-ep-fade" />
                </div>

                <div className="s-ep-title">
                  {getPartTitle(part, i)}
                </div>
              </div>
            ))
          ) : (
            <div className="s-no-ep">
              No parts
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

export default function MiniSeriesRow({
  movies,
  onSeeAll,
}: {
  movies: any[]
  onSeeAll?: (v: string) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return

    trackRef.current.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    })
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
            onSeeAll?.("mini series")
          }
        >
          Mini Series
        </h3>

        <button
          className="series-see"
          type="button"
          onClick={() =>
            onSeeAll?.("mini series")
          }
        >
          SEE ALL
        </button>
      </div>

      <div className="series-track-wrap">
        <button
          className="s-arrow left"
          type="button"
          onClick={() => scroll("left")}
          aria-label="Previous"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <button
          className="s-arrow right"
          type="button"
          onClick={() => scroll("right")}
          aria-label="Next"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        <div
          className="series-track"
          ref={trackRef}
        >
          {movies.map((m: any) => (
            <MiniCard
              key={m.id}
              m={m}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
