"use client"

import { useRouter } from "next/navigation"
import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react"
import "./movies.css"
import "./latest-movies.css"
import MovieRow from "./_components/movie-row"
import UserListsRow from "./_components/user-lists-row"
import { getSections } from "./_lib/sections.config"
import { useMovieStore } from "./_lib/use-movie-store"
import { Movie as LibMovie } from "./_lib/types"
import ExploreMore from "./_lib/explore-more"
import GenreFilter from "./_lib/genre-filter"
import TvSeriesRow from "./_lib/tv-series-row"
import MiniSeriesRow from "./_lib/mini-series-row"
import { useGlobalSearch } from "@/stores/use-global-search"

type ApiMovie = {
  id: any
  type?: string
  year?: number
  actors?: string
  seasons?: any[]

  title: string
  genre: string
  vj: string
  description: string
  cover_url: string
  video_url: string
  preview_urls: string[]
  views?: number
  likes?: number
  is_editors_pick?: boolean
  created_at?: string
}

const API_URL =
  "https://movie-server-api.connectu89.workers.dev/api/movies"

/* -------------------------------------------------------
   CLICK / SWIPE GUARD
   ------------------------------------------------------- */

function SwipeSafeButton({
  children,
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const movedRef = useRef(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)

  const handlePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>
  ) => {
    movedRef.current = false
    startXRef.current = e.clientX
    startYRef.current = e.clientY
  }

  const handlePointerMove = (
    e: React.PointerEvent<HTMLButtonElement>
  ) => {
    const dx = Math.abs(e.clientX - startXRef.current)
    const dy = Math.abs(e.clientY - startYRef.current)

    /*
     * 8px gives a clean separation between:
     * - real tap
     * - horizontal/vertical drag
     */
    if (dx > 8 || dy > 8) {
      movedRef.current = true
    }
  }

  const handlePointerCancel = () => {
    movedRef.current = true
  }

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (movedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    onClick?.(e)
  }

  return (
    <button
      {...props}
      className={className}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerCancel={handlePointerCancel}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

/* -------------------------------------------------------
   MOVIE STRIP CARD
   ------------------------------------------------------- */

function StripCard({
  movie,
  index,
  prefix,
  movieCount,
  onSelect,
}: {
  movie: LibMovie
  index: number
  prefix: string
  movieCount: number
  onSelect: (index: number) => void
}) {
  const movedRef = useRef(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)

  const handlePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>
  ) => {
    movedRef.current = false
    startXRef.current = e.clientX
    startYRef.current = e.clientY
  }

  const handlePointerMove = (
    e: React.PointerEvent<HTMLButtonElement>
  ) => {
    const dx = Math.abs(e.clientX - startXRef.current)
    const dy = Math.abs(e.clientY - startYRef.current)

    if (dx > 8 || dy > 8) {
      movedRef.current = true
    }
  }

  const handlePointerCancel = () => {
    movedRef.current = true
  }

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    /*
     * Browser can generate a click after a swipe.
     * Kill that click completely.
     */
    if (movedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    onSelect(index % movieCount)
  }

  return (
    <button
      type="button"
      className="strip-card"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerCancel={handlePointerCancel}
      onClick={handleClick}
    >
      <img
        src={movie.cover}
        alt={movie.title}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </button>
  )
}

export default function MoviesPage() {
  const [allMovies, setAllMovies] = useState<LibMovie[]>([])
  const [active, setActive] = useState(0)
  const [anchor, setAnchor] = useState<"full" | "preview">("full")
  const [clicking, setClicking] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const pauseRef = useRef<number>(0)
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { favIds, recentIds, lists, createList } =
    useMovieStore() as any

  const store = useMovieStore() as any
  const router = useRouter()

  /* -------------------------------------------------------
     LOAD API DATA
     ------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(API_URL, {
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error(`Movie API failed: ${res.status}`)
        }

        const data: ApiMovie[] = await res.json()

        if (cancelled) return

        const mapped: LibMovie[] = data.map((m) => ({
          id: m.id,
          title: m.title.toLowerCase(),
          genre: m.genre,
          vj: m.vj,
          cover: m.cover_url,
          desc: m.description,
          video: m.video_url,
          preview: m.preview_urls,

          /*
           * Keep your existing fallback behavior.
           */
          views:
            (m as any).views ||
            Math.floor(Math.random() * 5000),

          likes:
            (m as any).likes ||
            Math.floor(Math.random() * 1000),

          isEditorsPick:
            (m as any).is_editors_pick || false,

          createdAt: (m as any).created_at,
          type: (m as any).type || "Single",
          year: (m as any).year,
          actors: (m as any).actors,
          seasons: (m as any).seasons || [],
        }))

        setAllMovies(mapped)
        useGlobalSearch.getState().setAll(mapped)
      } catch (error) {
        console.error("Failed to load movies:", error)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  /*
   * Only the first 6 feed the hero.
   */
  const movies = useMemo(
    () => allMovies.slice(0, 6),
    [allMovies]
  )

  /* -------------------------------------------------------
     HERO AUTO ROTATION
     ------------------------------------------------------- */

  useEffect(() => {
    if (!movies.length) return

    const t = setInterval(() => {
      setActive((p) => (p + 1) % movies.length)
    }, 30000)

    return () => clearInterval(t)
  }, [movies])

  /* -------------------------------------------------------
     FULL / PREVIEW AUTO ROTATION
     ------------------------------------------------------- */

  useEffect(() => {
    const t = setInterval(() => {
      if (Date.now() < pauseRef.current) return

      setAnchor((p) =>
        p === "full" ? "preview" : "full"
      )
    }, 5000)

    return () => clearInterval(t)
  }, [])

  const handleManualAnchor = (
    type: "full" | "preview"
  ) => {
    setAnchor(type)

    /*
     * Pause automatic switching for 20 seconds
     * after the user manually chooses one.
     */
    pauseRef.current = Date.now() + 20000
  }

  const m = movies[active]

  const isInMyList = useMemo(
    () =>
      lists?.[0]?.movieIds?.includes(m?.id),
    [lists, m]
  )

  /* -------------------------------------------------------
     MY LIST
     ------------------------------------------------------- */

  const handleAddToList = useCallback(() => {
    if (!m) return

    if (isInMyList) {
      if (store.removeFromMyList) {
        store.removeFromMyList(m.id)
      } else if (store.toggleListMovie) {
        store.toggleListMovie("my-list", m.id)
      }

      return
    }

    let myList = lists?.[0]

    if (!myList) {
      createList("my-list")
      myList = lists?.[0] || {
        id: "my-list",
      }
    }

    if (store.addMovieToList) {
      store.addMovieToList(myList.id, m.id)
    } else if (store.addToList) {
      store.addToList(myList.id, m.id)
    } else if (store.toggleListMovie) {
      store.toggleListMovie(myList.id, m.id)
    } else if (store.addToMyList) {
      store.addToMyList(m.id)
    }

    setJustAdded(true)

    if (addTimerRef.current) {
      clearTimeout(addTimerRef.current)
    }

    addTimerRef.current = setTimeout(() => {
      setJustAdded(false)
    }, 1200)
  }, [
    m,
    lists,
    createList,
    store,
    isInMyList,
  ])

  /* -------------------------------------------------------
     SHARE
     ------------------------------------------------------- */

  const handleShare = useCallback(async () => {
    if (!m) return

    const url =
      `${window.location.origin}` +
      `/movies/watch/${m.id}?t=${anchor}`

    if ((navigator as any).share) {
      try {
        await (navigator as any).share({
          title: m.title,
          url,
        })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
      } catch {}
    }
  }, [m, anchor])

  /* -------------------------------------------------------
     PLAY
     ------------------------------------------------------- */

  const handlePlay = useCallback(() => {
    if (!m) return

    setClicking(true)

    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current)
    }

    playTimerRef.current = setTimeout(() => {
      setClicking(false)
    }, 420)

    router.push(
      `/movies/watch/${m.id}?t=${anchor}`
    )
  }, [m, anchor, router])

  /* -------------------------------------------------------
     CLEANUP TIMERS
     ------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current)
      }

      if (addTimerRef.current) {
        clearTimeout(addTimerRef.current)
      }
    }
  }, [])

  /* -------------------------------------------------------
     DYNAMIC SEE ALL
     ------------------------------------------------------- */

  const handleSeeAll = useCallback(
    (value: string) => {
      try {
        let clean = (value || "")
          .toLowerCase()
          .trim()

        const s: any =
          useGlobalSearch.getState()

        if (!clean || clean === "all") {
          s.setQuery?.("")
          s.setSection?.(null)
          return
        }

        if (
          !clean.includes("movies") &&
          clean.split(" ").length === 1
        ) {
          clean = `${clean} movies`
        }

        s.setQuery?.(clean)
        s.setSection?.(clean)

        if (s.setOpen) {
          s.setOpen(true)
        } else if (s.setIsOpen) {
          s.setIsOpen(true)
        } else if (s.openDrawer) {
          s.openDrawer()
        }
      } catch {}
    },
    []
  )

  /* -------------------------------------------------------
     SECTIONS
     ------------------------------------------------------- */

  const sections = useMemo(
    () =>
      getSections(allMovies, {
        favIds,
        recentIds,
      }),
    [allMovies, favIds, recentIds]
  )

  const tvSeriesMovies = useMemo(
    () =>
      allMovies.filter(
        (x: any) => x.type === "Full"
      ),
    [allMovies]
  )

  const miniSeriesMovies = useMemo(
    () =>
      allMovies.filter(
        (x: any) => x.type === "Mini"
      ),
    [allMovies]
  )

  if (!allMovies.length) {
    return (
      <div className="film-root">
        <div
          className="film-giant"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Loading latest...
        </div>
      </div>
    )
  }

  return (
    <div className="film-root">
      <div className="film-giant">
        <div className="film-bg">
          <div className="gblob b1" />
          <div className="gblob b2" />
        </div>

        {/* -------------------------------------------------
            UPPER STRIP
            ------------------------------------------------- */}

        <div className="strip-wrap upper full">
          <div className="strip-track ltr">
            {[...movies, ...movies, ...movies].map(
              (x, i) => (
                <StripCard
                  key={`u-${i}-${x.id}`}
                  movie={x}
                  index={i}
                  prefix="u"
                  movieCount={movies.length}
                  onSelect={setActive}
                />
              )
            )}
          </div>
        </div>

        {/* -------------------------------------------------
            CENTER HERO
            ------------------------------------------------- */}

        <div className="film-center">
          <div className="center-cover">
            <img
              src={m.cover}
              alt={m.title}
              /*
               * Hero image is immediately visible.
               * Do NOT lazy-load the main active image.
               */
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />

            <div className="center-fade" />

            <div className="center-top">
              <span
                className="c-pill"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  handleSeeAll(m.genre)
                }
              >
                {m.genre}
              </span>

              <span
                className="c-pill muted"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  handleSeeAll(m.vj)
                }
              >
                {m.vj}
              </span>
            </div>

            <div className="center-desc">
              <div
                className="c-title"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  handleSeeAll(m.title)
                }
              >
                {m.title}
              </div>

              <div className="c-meta">
                {m.genre} • {m.vj}
              </div>

              <div className="c-text">
                {m.desc}
              </div>
            </div>

            {/* DESKTOP HERO ACTIONS */}

            <div className="hero-corner-actions pc-only">
              <SwipeSafeButton
                type="button"
                className={`hca-btn ${
                  isInMyList ? "added" : ""
                } ${justAdded ? "pop" : ""}`}
                onClick={handleAddToList}
              >
                {isInMyList ? (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    ADDED
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    MY LIST
                  </>
                )}
              </SwipeSafeButton>

              <SwipeSafeButton
                type="button"
                className="hca-btn"
                onClick={handleShare}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle
                    cx="18"
                    cy="5"
                    r="3"
                  />
                  <circle
                    cx="6"
                    cy="12"
                    r="3"
                  />
                  <circle
                    cx="18"
                    cy="19"
                    r="3"
                  />
                  <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
                </svg>
                SHARE
              </SwipeSafeButton>
            </div>

            {/* MAIN PLAY */}

            <button
              type="button"
              className={`play-3d glass ${anchor} ${
                clicking ? "clicking" : ""
              }`}
              onClick={handlePlay}
              aria-label="play"
            >
              <span
                key={anchor}
                className={`play-smoke ${anchor}`}
              />

              <span className="play-smoke-2" />

              <span className="play-core">
                <svg
                  viewBox="0 0 24 24"
                  className="play-tri"
                  aria-hidden
                >
                  <path
                    d="M8 5.8 L18 12 L8 18.2 Z"
                    fill="white"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* -------------------------------------------------
            LOWER STRIP
            ------------------------------------------------- */}

        <div className="strip-wrap lower full">
          <div className="strip-track rtl">
            {[...movies, ...movies, ...movies]
              .reverse()
              .map((x, i) => (
                <StripCard
                  key={`l-${i}-${x.id}`}
                  movie={x}
                  index={i}
                  prefix="l"
                  movieCount={movies.length}
                  onSelect={setActive}
                />
              ))}
          </div>
        </div>

        {/* -------------------------------------------------
            CONTROLS
            ------------------------------------------------- */}

        <div className="controls-row">
          <div className="dots-wrap pc-only">
            {movies.map((_, i) => (
              <SwipeSafeButton
                key={i}
                type="button"
                className={`dot ${
                  i === active ? "active" : ""
                }`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>

          <div className="anchor-btns pc-only">
            <SwipeSafeButton
              type="button"
              className={`a-btn full ${
                anchor === "full" ? "on" : ""
              }`}
              onClick={() =>
                handleManualAnchor("full")
              }
            >
              FULL MOVIE
            </SwipeSafeButton>

            <SwipeSafeButton
              type="button"
              className={`a-btn prev ${
                anchor === "preview" ? "on" : ""
              }`}
              onClick={() =>
                handleManualAnchor("preview")
              }
            >
              PREVIEW
            </SwipeSafeButton>
          </div>

          {/* MOBILE */}

          <div className="mobile-same-line mobile-only">
            <SwipeSafeButton
              type="button"
              className={`m-icon-btn left ${
                isInMyList ? "added" : ""
              } ${justAdded ? "pop" : ""}`}
              onClick={handleAddToList}
              aria-label="my list"
            >
              {isInMyList ? (
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              )}
            </SwipeSafeButton>

            <div className="anchor-btns">
              <SwipeSafeButton
                type="button"
                className={`a-btn full ${
                  anchor === "full" ? "on" : ""
                }`}
                onClick={() =>
                  handleManualAnchor("full")
                }
              >
                FULL MOVIE
              </SwipeSafeButton>

              <SwipeSafeButton
                type="button"
                className={`a-btn prev ${
                  anchor === "preview" ? "on" : ""
                }`}
                onClick={() =>
                  handleManualAnchor("preview")
                }
              >
                PREVIEW
              </SwipeSafeButton>
            </div>

            <SwipeSafeButton
              type="button"
              className="m-icon-btn right"
              onClick={handleShare}
              aria-label="share"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle
                  cx="18"
                  cy="5"
                  r="3"
                />
                <circle
                  cx="6"
                  cy="12"
                  r="3"
                />
                <circle
                  cx="18"
                  cy="19"
                  r="3"
                />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
            </SwipeSafeButton>
          </div>
        </div>
      </div>

      <GenreFilter onSelect={handleSeeAll} />

      {sections.slice(0, 4).map((s: any) => {
        if (s.hidden) return null
        if (!s.data?.length) return null

        return (
          <MovieRow
            key={s.id}
            title={s.title}
            movies={s.data}
            onSeeAll={handleSeeAll}
          />
        )
      })}

      {tvSeriesMovies.length > 0 && (
        <TvSeriesRow
          movies={tvSeriesMovies}
          onSeeAll={handleSeeAll}
        />
      )}

      {sections.slice(4, 7).map((s: any) => {
        if (s.hidden) return null
        if (!s.data?.length) return null

        return (
          <MovieRow
            key={s.id}
            title={s.title}
            movies={s.data}
            onSeeAll={handleSeeAll}
          />
        )
      })}

      {miniSeriesMovies.length > 0 && (
        <MiniSeriesRow
          movies={miniSeriesMovies}
          onSeeAll={handleSeeAll}
        />
      )}

      {sections.slice(7).map((s: any) => {
        if (s.hidden) return null
        if (!s.data?.length) return null

        return (
          <MovieRow
          key={s.id}
            title={s.title}
            movies={s.data}
            onSeeAll={handleSeeAll}
          />
        )
      })}

      <UserListsRow movies={allMovies} />
      <ExploreMore movies={allMovies} />
    </div>
  )
}
