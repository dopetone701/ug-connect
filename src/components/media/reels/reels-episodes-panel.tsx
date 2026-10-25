"use client"

import "./reels-episodes-panel.css"
import { useEffect, useMemo, useState } from "react"
import { useEpisodesPanel } from "@/stores/use-episodes-panel"
import { useMovieStore } from "@/stores/use-movie-store"
import { getEpisodeInfo } from "./reels-action-logic/reels-episodes-logic/episodes-info"
import { EpisodesGrid } from "./reels-action-logic/reels-episodes-logic/episodes-grid"
import { EpisodesIntro } from "./reels-action-logic/reels-episodes-logic/episodes-intro"

const RANGE_SIZE = 50
const EXIT_MS = 350

type Tab = "intro" | "episodes"

type Props = {
  /** Called when an episode is tapped. */
  onSelectEpisode?: (movieId: string, episode: number) => void
  /** Currently playing episode (1-based), highlighted in the grid. */
  currentEpisode?: number
}

export function ReelsEpisodesPanel({ onSelectEpisode, currentEpisode }: Props) {
  const { isOpen, close, movieId, movie } = useEpisodesPanel() as any

  // `mounted` keeps the DOM alive during the exit animation.
  // `shown` flips two frames after mount so the slide-in transition actually runs.
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)
  const [tab, setTab] = useState<Tab>("episodes")
  const [range, setRange] = useState(0)

  // Same My List logic as the watch page buttons: useMovieStore lists + add/remove.
  const { lists, addToMyList, removeFromMyList } = useMovieStore() as any
  const myList = lists?.find((l: any) => l.id === "my-list") || lists?.[0]
  const targetId = String(movieId ?? "")
  const isInMyList = !!myList?.movieIds?.some((x: any) => String(x) === targetId)
  const handleMyList = () => {
    if (!targetId) return
    if (isInMyList) removeFromMyList(targetId)
    else addToMyList(targetId)
  }

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      setTab("episodes")
      setRange(0)
      let raf2 = 0
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShown(true))
      })
      return () => {
        cancelAnimationFrame(raf1)
        cancelAnimationFrame(raf2)
      }
    }
    setShown(false)
    const t = setTimeout(() => setMounted(false), EXIT_MS)
    return () => clearTimeout(t)
  }, [isOpen])

  const info = useMemo(() => getEpisodeInfo(movie), [movie])

  if (!mounted || !movieId || !info.isSeries) return null

  const total = info.totalEpisodes
  const rangeCount = Math.max(1, Math.ceil(total / RANGE_SIZE))
  const ranges = Array.from({ length: rangeCount }, (_, i) => {
    const start = i * RANGE_SIZE + 1
    const end = Math.min(total, (i + 1) * RANGE_SIZE)
    return { start, end, label: `${start}-${end}` }
  })
  const active = ranges[Math.min(range, ranges.length - 1)]

  return (
    <>
      <div className={`reps-backdrop ${shown ? "open" : ""}`} onClick={close} />
      <div className={`reps-panel ${shown ? "open" : ""}`} role="dialog" aria-label="Episodes">
        <div className="reps-top">
          <button type="button" className="reps-close" onClick={close} aria-label="Close">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        <div className="reps-head">
          {info.poster ? (
            <img className="reps-poster" src={info.poster} alt="" />
          ) : (
            <div className="reps-poster" />
          )}
          <div className="reps-meta">
            <div className="reps-title">{info.title}</div>
            <div className="reps-sub">{total} Episodes</div>
          </div>
          <button type="button" className={`reps-add ${isInMyList ? "added" : ""}`} onClick={handleMyList}>
            {isInMyList ? "In My List" : "Add to My List"}
          </button>
        </div>

        <div className="reps-tabs">
          <button type="button" className={`reps-tab ${tab === "intro" ? "active" : ""}`} onClick={() => setTab("intro")}>
            Introduction
          </button>
          <button type="button" className={`reps-tab ${tab === "episodes" ? "active" : ""}`} onClick={() => setTab("episodes")}>
            Episodes
          </button>
        </div>

        {tab === "intro" ? (
          <div className="reps-scroll">
            <EpisodesIntro movie={movie} movieId={movieId} />
          </div>
        ) : (
          <>
            {ranges.length > 1 && (
              <div className="reps-ranges">
                {ranges.map((r, i) => (
                  <button
                    key={r.label}
                    type="button"
                    className={`reps-range ${i === range ? "active" : ""}`}
                    onClick={() => setRange(i)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}

            <div className="reps-scroll">
              <EpisodesGrid
                start={active.start}
                end={active.end}
                freeEpisodes={info.freeEpisodes}
                currentEpisode={currentEpisode}
                onSelect={(n) => {
                  onSelectEpisode?.(movieId, n)
                  close()
                }}
              />
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default ReelsEpisodesPanel

