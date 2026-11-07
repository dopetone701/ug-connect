"use client"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useMovieStore } from "@/stores/use-movie-store"
import { sloganForVJ } from "./use-vj-view-panel"
import { VJCinematicName } from "./vj-pro-cinematic-font"
import { VJWallet } from "./vj-wallet"

const norm = (s: string) => String(s || "").trim().toLowerCase()

// ⚠️ CHANGE THIS if your logo lives elsewhere: /logo.png, /images/ug-logo.png, etc.
const UG_LOGO = "/logo.png"

const FAQS = [
  {
    q: "Who is a VJ?",
    a: "VJ stands for Video Joker — the voice behind the movie. A VJ watches a Hollywood, Nollywood or action film and translates it live into Luganda, adding jokes, drama, emotion and local flavour. Without the VJ, the movie is just pictures. With the VJ, it becomes OUR story.",
  },
  {
    q: "Why should I tip my VJ?",
    a: "Because great work deserves appreciation. Your VJ spends hours studying the film, finding the right words, timing every joke, and turning a foreign movie into edutainment — education + entertainment — that your whole family can enjoy. A tip says: “I see your craft. Keep going.” It keeps the best voices motivated to make the next movie even better.",
  },
  {
    q: "Who receives my tip?",
    a: "The VJ. Directly. 100% of your tip goes into the VJ's pocket. UG Connect does NOT receive VJ tips and does NOT take a cut. We built this so fans can appreciate the voice they love — straight, honest, and direct.",
  },
  {
    q: "How much should I tip?",
    a: "Whatever your heart says. UGX 1,000 says thank you. UGX 5,000 says you made my day. UGX 20,000 says you are a legend. There is no wrong amount — every tip is respect.",
  },
]

export function VJViewBody({ vjId, vj, onClose }: { vjId: string; vj: any; onClose: () => void }) {
  const router = useRouter()
  const [showFaq, setShowFaq] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // FIX: getSnapshot loop — never return a new array from a Zustand selector.
  const store = useMovieStore() as any
  const allMovies: any[] = useMemo(() => {
    const list = store?.movies || store?.allMovies || store?.list || []
    return Array.isArray(list) ? list : []
  }, [store?.movies, store?.allMovies, store?.list])

  const vjMovies = useMemo(() => {
    const target = norm(vj?.name)
    if (!target) return []
    return allMovies.filter((m: any) => norm(m?.vj) === target || norm(m?.vjName) === target)
  }, [allMovies, vj?.name])

  const slogan = sloganForVJ(vj?.name, vj?.slogan)
  const count = vjMovies.length

  return (
    <div className="vj-view-body">
      <div className="vj-topbar">
        <span className="vj-topbar-label">VIDEO JOKER</span>
        <button
          type="button"
          className="vj-faq-btn"
          aria-label="What is a VJ? FAQ"
          aria-expanded={showFaq}
          onClick={() => setShowFaq((v) => !v)}
        >?</button>
      </div>

      {/* HEADER: logo as subtle glass bg, fades to bottom — same idea as actor hero image */}
      <div className="vj-hero">
        <img src={UG_LOGO} alt="" aria-hidden="true" draggable={false} className="vj-logo-bg" />
        <div className="vj-logo-fade" aria-hidden="true" />
        <VJCinematicName name={vj?.name || "VJ"} />
        <p className="vj-slogan">“{slogan}”</p>
        <div className="vj-stats">
          <span><strong>{count}</strong> {count === 1 ? "Movie" : "Movies"} on UG Connect</span>
          <span className="vj-dot">•</span>
          <span>Luganda • Edutainment</span>
        </div>
      </div>

      {showFaq && (
        <div className="vj-faq">
          <h3 className="vj-section-title">Know Your VJ</h3>
          {FAQS.map((f, i) => (
            <div key={i} className="vj-faq-item">
              <button type="button" className="vj-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{f.q}</span><span>{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && <p className="vj-faq-a">{f.a}</p>}
            </div>
          ))}
        </div>
      )}

      {!showTip ? (
        <div className="vj-tip-banner">
          <div>
            <p className="vj-tip-kicker">He gave you the laughs. Give him his flowers. 💐</p>
            <p className="vj-tip-line">A small tip keeps the best voice in Uganda going. <strong>100% goes to {vj?.name}.</strong></p>
          </div>
          <button type="button" className="vj-tip-cta" onClick={() => setShowTip(true)}>😍 Tip {vj?.name}</button>
        </div>
      ) : (
        <VJWallet vjName={vj?.name} onClose={() => setShowTip(false)} />
      )}

      {/* MOVIES ROW — no "tap a movie" hint, no "no movies" text: every VJ here has movies */}
      <div className="vj-movies-head">
        <h3 className="vj-section-title">Movies by {vj?.name} <span className="vj-count-badge">{count}</span></h3>
      </div>

      <div className="vj-movie-row">
        {vjMovies.map((m: any) => {
          const poster = m.poster || m.thumbnail || m.image || m.cover || ""
          const title = m.title || m.name || "Untitled"
          return (
            <button
              key={String(m.id)}
              type="button"
              className="vj-movie-card"
              onClick={() => { onClose(); router.push(`/movies/watch/${m.id}`) }}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            >
              <span className="vj-movie-img-wrap">
                {poster ? (
                  <img src={poster} alt="" draggable={false} className="vj-movie-img" loading="lazy" />
                ) : (
                  <span className="vj-movie-fallback">{String(title).charAt(0)}</span>
                )}
              </span>
              <span className="vj-movie-title">{title}</span>
              <span className="vj-movie-meta">{m.year || ""} {m.genre ? `• ${m.genre}` : ""}</span>
            </button>
          )
        })}
      </div>
      <div style={{ height: 12 }} />
    </div>
  )
}

