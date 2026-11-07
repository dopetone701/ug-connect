"use client"

// Cinematic header — no image. Big condensed type does the work.
// Uses Bebas Neue (loaded in vj-view.css) with system fallbacks so it
// never breaks if the font is offline.
export function VJCinematicName({ name }: { name: string }) {
  // Split "VJ Junior" -> eyebrow "VJ" + big "JUNIOR"
  const parts = String(name || "VJ").trim().split(/\s+/)
  const eyebrow = parts.length > 1 ? parts[0] : "VJ"
  const rest = parts.length > 1 ? parts.slice(1).join(" ") : parts[0]
  return (
    <div className="vj-cinematic">
      <span className="vj-cinematic-eyebrow">{eyebrow} &nbsp;•&nbsp; UG CONNECT PRESENTS</span>
      <h2 className="vj-cinematic-name">{rest}</h2>
      <div className="vj-cinematic-rule"><span /></div>
    </div>
  )
}

