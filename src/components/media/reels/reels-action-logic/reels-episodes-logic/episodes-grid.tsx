"use client"

type Props = {
  start: number
  end: number
  freeEpisodes: number
  currentEpisode?: number
  onSelect: (episode: number) => void
}

/** The 5-column grid of episode tiles. Styles live in ../../reels-episodes-panel.css */
export function EpisodesGrid({ start, end, freeEpisodes, currentEpisode, onSelect }: Props) {
  const episodes = Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i)

  return (
    <div className="reps-grid">
      {episodes.map((n) => {
        const vip = n > freeEpisodes
        return (
          <button
            key={n}
            type="button"
            className={`reps-ep ${vip ? "vip" : ""} ${n === currentEpisode ? "current" : ""}`}
            onClick={() => onSelect(n)}
          >
            <span className="reps-ep-num">{n}</span>
            {vip && <span className="reps-ep-vip">VIP</span>}
          </button>
        )
      })}
    </div>
  )
}

export default EpisodesGrid

