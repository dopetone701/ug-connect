"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useMovieStore } from "../_lib/use-movie-store"
import "../latest-movies.css"

type Props = {
  movies?: any[]
}

export default function UserListsRow({ movies = [] }: Props) {
  const { lists, createList, addRecent } = useMovieStore() as any
  const router = useRouter()

  useEffect(() => {
    if (lists.length === 0) {
      createList("my-list")
    }
  }, [lists.length, createList])

  const mainList = lists[0]

  if (!mainList) {
    return (
      <div className="latest-root">
        <div className="latest-head">
          <h3 className="latest-title">my list</h3>
        </div>

        <div className="latest-track-wrap">
          <div className="latest-track">
            <div className="latest-card">
              <div
                className="l-card-cover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "hsl(var(--surface))",
                  borderRadius: 6,
                }}
              >
                <span style={{ fontWeight: 900, fontSize: 13 }}>
                  MY LIST
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const myMovies = movies.filter((m: any) =>
    mainList.movieIds?.includes(m.id)
  )

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title">my list</h3>

        <span className="latest-see">
          {mainList.movieIds?.length || 0} movies
        </span>
      </div>

      <div className="latest-track-wrap">
        <div className="latest-track">
          {myMovies.length === 0 ? (
            <div className="latest-card">
              <div
                className="l-card-cover"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  alignItems: "center",
                  justifyContent: "center",
                  background: "hsl(var(--surface))",
                  borderRadius: 6,
                }}
              >
                <span style={{ fontWeight: 900, fontSize: 14 }}>
                  MY LIST
                </span>

                <span style={{ fontSize: 10, opacity: 0.6 }}>
                  EMPTY
                </span>
              </div>
            </div>
          ) : (
            myMovies.map((movie: any) => (
              <ListMovieCard
                key={movie.id}
                movie={movie}
                router={router}
                addRecent={addRecent}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}


/* =========================================================
   MOVIE CARD
   Prevents accidental navigation while scrolling/swiping.
   ========================================================= */

function ListMovieCard({
  movie,
  router,
  addRecent,
}: {
  movie: any
  router: ReturnType<typeof useRouter>
  addRecent: (id: number) => void
}) {
  const movedRef = useRef(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)

  const handlePointerDown = (e: React.PointerEvent) => {
    movedRef.current = false
    startXRef.current = e.clientX
    startYRef.current = e.clientY
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - startXRef.current)
    const dy = Math.abs(e.clientY - startYRef.current)

    if (dx > 6 || dy > 6) {
      movedRef.current = true
    }
  }

  const handlePointerUp = () => {
    setTimeout(() => {
      movedRef.current = false
    }, 100)
  }

  const openMovie = (
    e: React.MouseEvent,
    mode: "full" | "preview"
  ) => {
    e.stopPropagation()

    if (movedRef.current) {
      e.preventDefault()
      return
    }

    addRecent(movie.id)

    router.push(
      mode === "full"
        ? `/movies/watch/${movie.id}`
        : `/movies/watch/${movie.id}?t=preview`
    )
  }

  return (
    <div
      className="latest-card"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="l-card-cover"
        style={{ borderRadius: 6 }}
      >
        <img
          src={movie.cover}
          alt={movie.title}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />

        <div className="l-card-fade" />

        <div
          className="l-card-actions"
          style={{
            borderRadius: "0 0 6px 6px",
          }}
        >
          <button
            type="button"
            className="l-a-btn play on"
            style={{ borderRadius: "0 0 0 6px" }}
            onClick={(e) => openMovie(e, "full")}
          >
            PLAY
          </button>

          <button
            type="button"
            className="l-a-btn prev on"
            style={{ borderRadius: "0 0 6px 0" }}
            onClick={(e) => openMovie(e, "preview")}
          >
            PRE
          </button>
        </div>
      </div>
    </div>
  )
}
