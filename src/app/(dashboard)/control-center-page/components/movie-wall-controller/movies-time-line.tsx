"use client"
import type { BattleGroup } from "@/app/(dashboard)/movies/_lib/movie-wall-logic/movie-wall-groups"
import TimeLineChopers from "./time-line-chopers"
import { useMovieWallController, clipForVj, formatTime } from "./use-movie-wall-controller"
import "./time-line.css"

// Column of timelines — 1 per VJ in the battle.
// Master chopper on top chops ALL at once. Per-VJ offset nudges one VJ to same scene.
export default function MoviesTimeLine({ group, durations }: { group: BattleGroup; durations: Record<string, number> }) {
  const clip = useMovieWallController((s) => s.clips[group.key])
  const setMaster = useMovieWallController((s) => s.setMaster)
  const setVjOffset = useMovieWallController((s) => s.setVjOffset)
  const setClip = useMovieWallController((s) => s.setClip)

  if (!clip) return <div className="mwcp-empty">Auto…</div>

  const masterDuration = Math.max(...group.vjs.map((v) => durations[String(v.id)] || clip.duration || 0), clip.duration || 0, 1)

  return (
    <div className="mwcp-timelines">
      <div className="mwcp-master">
        <span className="mwcp-master-badge">{group.title}</span>
        <TimeLineChopers duration={masterDuration} start={clip.start} end={clip.end} label={group.title}
          onChange={(s, e) => setMaster(group.key, s, e, { title: group.title, duration: masterDuration })} />
      </div>

      {group.vjs.map((vj) => {
        const d = durations[String(vj.id)] || masterDuration
        const eff = clipForVj(clip, String(vj.id))
        return (
          <div key={String(vj.id)} className="mwcp-vj-row">
            <div className="mwcp-vj-head">
              <strong>{vj.vj}</strong>
              <span>{formatTime(eff.start)} → {formatTime(eff.end)}</span>
            </div>
            {/* Per-VJ timeline is READ-ONLY view of master+offset — drag master, not this */}
            <div className="mwcp-vj-bar">
              <div className="mwcp-vj-fill" style={{ left: `${(eff.start / d) * 100}%`, width: `${((eff.end - eff.start) / d) * 100}%` }} />
            </div>
            <label className="mwcp-offset">
              Nudge:
              <input type="range" min={-120} max={120} step={1} value={eff.offset}
                onChange={(e) => setVjOffset(group.key, String(vj.id), Number(e.target.value))} />
              <b>{eff.offset > 0 ? `+${eff.offset}s` : `${eff.offset}s`}</b>
              <button type="button" onClick={() => setVjOffset(group.key, String(vj.id), 0)}>Reset</button>
            </label>
          </div>
        )
      })}

      
      
    </div>
  )
}

