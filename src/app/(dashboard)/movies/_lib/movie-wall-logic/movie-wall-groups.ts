"use client"
import type { Movie } from "../types"

export type BattleVJ = Movie & { vj: string }
export type BattleGroup = {
  key: string
  title: string
  cover: string
  genre: string
  desc: string
  vjs: BattleVJ[]
  mostViewed: BattleVJ
  totalViews: number
}

function norm(s: string) {
  return (s || "").toLowerCase().trim().replace(/\s+/g, " ")
}

export function groupMoviesForBattle(allMovies: Movie[]): BattleGroup[] {
  // DEBUG — keep this for 1 reload, then delete it
  console.log("BATTLE DEBUG — total movies in:", allMovies.length)
  allMovies.forEach((m: any) => {
    console.log(`  movie: title="${m.title}" | vj="${m.vj}" | type="${m.type}" | id=${m.id}`)
  })

  const singles = allMovies.filter((m) => !m.type || m.type === "Single" || m.type === "single")
  console.log("BATTLE DEBUG — after Single filter:", singles.length)

  const byTitle = new Map<string, Movie[]>()
  for (const m of singles) {
    const key = norm(m.title)
    if (!key) continue
    if (!byTitle.has(key)) byTitle.set(key, [])
    byTitle.get(key)!.push(m)
  }

  const groups: BattleGroup[] = []
  for (const [key, list] of byTitle) {
    // FIX: don't collapse same VJ name anymore.
    // Before: if you uploaded 3x with VJ = "test", they collapsed to 1.
    // Now: each upload = its own tile, even if VJ name repeats.
    // We keep the VJ name for display, but dedupe by movie id.
    const seen = new Set<string>()
    const vjs: BattleVJ[] = []
    for (const m of list) {
      const idKey = String((m as any).id)
      if (seen.has(idKey)) continue
      seen.add(idKey)
      vjs.push({ ...m, vj: (m.vj || "VJ").trim() || "VJ" } as BattleVJ)
    }
    vjs.sort((a, b) => (b.views || 0) - (a.views || 0))
    console.log(`BATTLE DEBUG — group "${key}": ${list.length} movies -> ${vjs.length} tiles, vjs=[${vjs.map((v) => v.vj).join(", ")}]`)
    if (vjs.length < 2) continue // 1 never renders
    const first = vjs[0]
    groups.push({
      key,
      title: first.title,
      cover: first.cover || "",
      genre: first.genre || "",
      desc: first.desc || "",
      vjs,
      mostViewed: first,
      totalViews: vjs.reduce((s, v) => s + (v.views || 0), 0),
    })
  }
  groups.sort((a, b) => b.totalViews - a.totalViews)
  return groups
}