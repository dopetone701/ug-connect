"use client"
import { useEffect, useMemo, useState } from "react"
import { useWallControlPanel } from "./use-wall-control-panel"
import { useMovieWallController, formatTime } from "./use-movie-wall-controller"
import { useMovieStore } from "@/stores/use-movie-store"
import { useGlobalSearch } from "@/stores/use-global-search"
import { groupMoviesForBattle } from "@/app/(dashboard)/movies/_lib/movie-wall-logic/movie-wall-groups"
import { queGetLayout, queHas } from "@/app/(dashboard)/movies/_lib/movie-wall-logic/movie-wall-que"
import MovieVideoPreview from "./movie-video-preview"
import AutoTimeLineChoper from "./auto-time-line-choper"
import MoviesTimeLine from "./movies-time-line"
import BattleSearchBar from "./battle-search-bar"
import "./wall-controller-panel.css"

// FIX: getSnapshot must be cached — never return a new [] inside a selector
// + Controller must SEE battles even if the store key is not "movies".
// We read the WHOLE store (stable ref) and scan every array for movie-like items.
function extractMoviesFromStore(state: any): any[] {
  if (!state || typeof state !== "object") return []
  const KNOWN = ["movies", "allMovies", "all", "list", "items", "data", "library", "catalog"]
  for (const k of KNOWN) {
    const v = state[k]
    if (Array.isArray(v) && v.length && typeof v[0] === "object" && (v[0].title || v[0].cover || v[0].video)) return v
  }
  // Fallback: scan ANY array in the store that looks like movies
  for (const v of Object.values(state)) {
    if (Array.isArray(v) && v.length && typeof v[0] === "object" && (v[0].title || v[0].cover || v[0].video)) return v as any[]
  }
  return []
}
function useBattles() {
  // TRUE SOURCE — Movies page does NOT use useMovieStore for movies.
  // Movies page: fetch(API) -> mapMovies() -> setAllMovies(local) + useGlobalSearch.setAll(mapped) + sessionStorage "movies_home_cache_v1"
  // So Controller must read from useGlobalSearch FIRST, then sessionStorage cache, then fetch same API.
  const globalState: any = useGlobalSearch((s: any) => s)
  const [cachedMovies, setCachedMovies] = useState<any[]>([])
  const [fetchedMovies, setFetchedMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 1. sessionStorage cache — same key Movies page uses
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("movies_home_cache_v1")
      if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed) && parsed.length) setCachedMovies(parsed) }
    } catch {}
  }, [])

  const globalMovies = useMemo(() => extractMoviesFromStore(globalState), [globalState])
  const movies = useMemo(() => {
    if (globalMovies.length) return globalMovies
    if (cachedMovies.length) return cachedMovies
    return fetchedMovies
  }, [globalMovies, cachedMovies, fetchedMovies])

  // 2. Fallback: fetch SAME API + SAME mapMovies as Movies page, only if both above empty
  useEffect(() => {
    if (movies.length > 0 || loading) return
    let cancelled = false
    setLoading(true)
    fetch("https://movie-server-api.connectu89.workers.dev/api/movies", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: any[]) => {
        if (cancelled || !Array.isArray(data)) return
        const mapped = data.map((m: any) => ({
          id: m.id, title: (m.title || "").toLowerCase(), genre: m.genre, vj: m.vj, cover: m.cover_url, desc: m.description, video: m.video_url, preview: m.preview_urls,
          views: typeof m.views === "number" ? m.views : 0, likes: typeof m.likes === "number" ? m.likes : 0, isEditorsPick: m.is_editors_pick || false, createdAt: m.created_at,
          type: m.type || "Single", year: m.year, actors: m.actors, seasons: m.seasons || [], category: m.category || "", origin: m.origin || m.category || "", country: m.country || m.category || "",
        }))
        setFetchedMovies(mapped)
        try { useGlobalSearch.getState().setAll(mapped) } catch {}
        try { sessionStorage.setItem("movies_home_cache_v1", JSON.stringify(mapped)) } catch {}
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [movies.length, loading])

  const groups = useMemo(() => groupMoviesForBattle(movies as any), [movies])
  return { movies, groups, storeKeys: Object.keys(globalState || {}), loading }
}

// CHIP — Control Center injects ONLY this, inside .cc-tabs
export function WallVjBattleChip() {
  const openPanel = useWallControlPanel((s) => s.openPanel)
  const clips = useMovieWallController((s) => s.clips)
  const { movies, groups } = useBattles()
  const needsChop = groups.filter((g) => !clips[g.key]?.isApproved).length
  return (
    <button type="button" className="mwcp-chip" onClick={() => openPanel(null)}>
      <span className="mwcp-chip-dot" />VJ BATTLE • {groups.length}{needsChop > 0 ? ` • ${needsChop} NEED CHOP` : " • ALL CHOPPED ✅"}<span className="mwcp-chip-arrow">↗</span>
    </button>
  )
}

// PANEL — slides from below, stops before topbar (top:64px), bottom bar hidden, DNA colors
// LOGIC INJECTED: battles list → chop view (preview + auto + master timelines)
export default function MovieWallControllerPanel() {
  const isOpen = useWallControlPanel((s) => s.isOpen)
  const closePanel = useWallControlPanel((s) => s.closePanel)
  const selectedBattleKey = useWallControlPanel((s) => s.selectedBattleKey)
  const view = useWallControlPanel((s) => s.view)
  const selectBattle = useWallControlPanel((s) => s.selectBattle)
  const backToBattles = useWallControlPanel((s) => s.backToBattles)
  const clips = useMovieWallController((s) => s.clips)
  const setClip = useMovieWallController((s) => s.setClip)

  const { movies, groups, storeKeys, loading } = useBattles()
  const selectedGroup = useMemo(() => groups.find((g) => g.key === selectedBattleKey) || null, [groups, selectedBattleKey])
  const [battleQuery, setBattleQuery] = useState<string>("")
  const filteredGroups = useMemo(() => {
    const q = battleQuery.toLowerCase().trim()
    if (!q) return groups
    return groups.filter((g) => g.title.toLowerCase().includes(q) || g.vjs.some((v) => v.vj.toLowerCase().includes(q)))
  }, [groups, battleQuery])

  const [activeVjId, setActiveVjId] = useState<string | null>(null)
  const [durations, setDurations] = useState<Record<string, number>>({})
  useEffect(() => { if (selectedGroup) setActiveVjId(String(selectedGroup.mostViewed.id)) }, [selectedGroup])

  // Lock scroll + hide bottom bar when open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.body.classList.add("mwcp-panel-open")
    return () => { document.body.style.overflow = prev; document.body.classList.remove("mwcp-panel-open") }
  }, [isOpen])
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closePanel() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, closePanel])

  const activeMovie = selectedGroup?.vjs.find((v) => String(v.id) === activeVjId) || selectedGroup?.mostViewed
  const activeClip = selectedGroup ? clips[selectedGroup.key] : undefined
  const activeDuration = activeMovie ? durations[String(activeMovie.id)] || activeClip?.duration || 3600 : 0

  return (
    <>
      <div className={`mwcp-backdrop ${isOpen ? "open" : ""}`} onClick={closePanel} />
      <section className={`mwcp-panel ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
        <header className="mwcp-topbar">
          <button type="button" className="mwcp-back" onClick={() => (view === "chop" ? backToBattles() : closePanel())}>{view === "chop" ? "← All Battles" : "✕ Close"}</button>
          <div className="mwcp-topbar-title"><strong>Movie Wall Controller</strong><span>{view === "chop" && selectedGroup ? selectedGroup.title : `${groups.length} Battles • Tap one to chop`}</span></div>
          <span className="mwcp-topbar-live">● LIVE WALL</span>
        </header>
        <div className="mwcp-grabber" onClick={closePanel} />
        <div className="mwcp-body">
          {view === "battles" || !selectedGroup ? (
            <>
              <BattleSearchBar value={battleQuery} onChange={setBattleQuery} total={groups.length} shown={filteredGroups.length} />
              <div className="mwcp-list">
              {groups.length === 0 && <div className="mwcp-empty"><p>No battles yet — need 2+ VJs with same title.</p><p style={{fontSize:11,opacity:.7}}>Found {movies.length} movies in store. Keys: {storeKeys.join(", ")}</p><p style={{fontSize:11,opacity:.7}}>{loading ? "Fetching battles from movie API…" : "Source: useGlobalSearch.setAll + sessionStorage movies_home_cache_v1 + same API as Movies page."}</p></div>}
              {filteredGroups.length === 0 && groups.length > 0 && <div className="mwcp-empty"><p>No battle matches “{battleQuery}”.</p></div>}
              {filteredGroups.map((g) => {
                const c = clips[g.key]
                return (
                  <button key={g.key} type="button" className="mwcp-card" onClick={() => selectBattle(g.key)}>
                    <img src={g.cover} alt="" />
                    <span className="mwcp-card-title">{g.title}</span>
                  </button>
                )
              })}
            </div>
            </>
          ) : (
            <div className="mwcp-chop">
              <div className="mwcp-video-sticky">
                {activeMovie && <MovieVideoPreview src={(activeMovie as any).video} title={selectedGroup.title} vjName={activeMovie.vj} start={activeClip?.start ?? 0} end={activeClip?.end ?? 35} group={selectedGroup} onDuration={(d) => { setDurations((prev) => ({ ...prev, [String(activeMovie.id)]: d })); if (!activeClip) setClip(selectedGroup.key, { duration: d, title: selectedGroup.title }) }} />}
              </div>
              <div className="mwcp-vj-switch">{selectedGroup.vjs.map((vj) => (<button key={String(vj.id)} type="button" className={String(vj.id) === String(activeVjId) ? "active" : ""} onClick={() => setActiveVjId(String(vj.id))}>{vj.vj} • {(vj.views || 0).toLocaleString()}</button>))}</div>
              <AutoTimeLineChoper battleKey={selectedGroup.key} title={selectedGroup.title} duration={activeDuration} />
              <MoviesTimeLine group={selectedGroup} durations={durations} />
              <p className="mwcp-foot">Wall plays only this clip — full movie opens on Watch Full.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

