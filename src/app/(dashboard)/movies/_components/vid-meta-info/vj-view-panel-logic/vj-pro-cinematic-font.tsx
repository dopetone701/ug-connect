"use client"


// Cinematic header — no image. Big condensed type does the work.
// Uses Bebas Neue (loaded in vj-view.css) with system fallbacks so it
// never breaks if the font is offline.
export function VJCinematicName({ name }: { name: string }) {
  // Full name in the NAME class — "VJ Junior" -> big "VJ JUNIOR"
  // Eyebrow is ONLY "UG CONNECT PRESENTS" — lil "VJ •" killed
  const fullName = String(name || "VJ").trim()
  return (
    <div className="vj-cinematic">
      <span className="vj-cinematic-eyebrow">UG CONNECT PRESENTS</span>
      <h2 className="vj-cinematic-name">{fullName}</h2>
      <div className="vj-cinematic-rule"><span /></div>
    </div>
  )
}

