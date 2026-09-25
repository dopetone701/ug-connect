"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { Movie } from "../_lib/types"
import { useMovieStore } from "../../../../stores/use-movie-store"
import { useWatchDrawer } from "@/stores/use-watch-drawer"
import { useReelsDrawer } from "@/stores/use-reels-drawer"

export default function MovieCard({
  m,
  allMovies,
}: {
  m: Movie
  allMovies?: Movie[]
}) {
  const router = useRouter()
  const { addRecent } = useMovieStore()
  const { openDrawer } = useWatchDrawer() as any
  const { openReels } = useReelsDrawer() as any

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
    }, 80)
  }

  const normalize = (x: any) => {
    const preview =
      x.preview_urls?.[0] ||
      x.preview_url ||
      x.trailer_url ||
      x.video_preview_url ||
      x.preview

    return {
      ...x,
      id: String(x.id),
      cover: x.cover || x.cover_url,
      cover_url: x.cover || x.cover_url,
      video: x.video || x.video_url,
      video_url: x.video || x.video_url,
      preview_url: preview,
      preview_urls: x.preview_urls || (preview ? [preview] : []),
      trailer_url: x.trailer_url || preview,
    }
  }

  const openMovie = (type: "full" | "preview" = "full") => {
    if (movedRef.current) return

    const id = String(m.id)
    addRecent(id)

    const nm = normalize(m)

    try {
      sessionStorage.setItem(
        "movies_home_scroll_v1",
        String(window.scrollY)
      )

      sessionStorage.setItem(
        `movie_preload_${id}`,
        JSON.stringify({
          id,
          title: nm.title,
          cover_url: nm.cover,
          video_url: nm.video_url,
          preview_url: nm.preview_url,
          preview_urls: nm.preview_urls,
          genre: nm.genre,
          vj: nm.vj,
          description: nm.desc,
        })
      )
    } catch {}

    const isDesktop =
      typeof window !== "undefined" && window.innerWidth > 768

    /*
     * DESKTOP
     * Both PLAY and PRE use the Connect player page.
     *
     * PRE:
     * /movies/watch/[id]?t=preview
     *
     * PLAY:
     * /movies/watch/[id]?t=full
     */
    if (isDesktop) {
      router.push(`/movies/watch/${id}?t=${type}`)
      return
    }

    /*
     * MOBILE
     * PRE uses the Reels drawer.
     */
    if (type === "preview") {
      const rawList =
        allMovies && allMovies.length
          ? allMovies
          : [m]

      const list = rawList.map(normalize)

      const idx = rawList.findIndex(
        (x) => String(x.id) === id
      )

      openReels(
        list,
        idx >= 0 ? idx : 0
      )

      return
    }

    /*
     * MOBILE
     * PLAY uses the Watch drawer.
     */
    openDrawer(id)
  }

  const openYT = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

    openMovie("full")
  }

  const openPreview = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

    openMovie("preview")
  }

  return (
    <div
      className="latest-card"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={openYT}
    >
      <div className="l-card-cover">
        <img
          src={m.cover}
          alt={m.title}
          loading="lazy"
          draggable={false}
        />

        <div className="l-card-fade" />

        <div className="l-card-vj-on">
          {m.vj}
        </div>

        <div className="l-card-actions">
          <button
            type="button"
            className="l-a-btn play on"
            onClick={openYT}
          >
            PLAY
          </button>

          <button
            type="button"
            className="l-a-btn prev on"
            onClick={openPreview}
          >
            PRE
          </button>
        </div>
      </div>
    </div>
  )
}
