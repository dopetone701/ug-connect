"use client"
import { useEffect, useMemo, useState } from "react"
import { useGlobalSearch } from "@/stores/use-global-search"
import { sloganForVJ } from "./use-vj-view-panel"
import { VJCinematicName } from "./vj-pro-cinematic-font"
import { VJWallet } from "./vj-wallet"
// REUSE exact row — same as ActorViewBody does. Do NOT rebuild cards here.
// Actor: import MovieRow from "../movie-row" (actor file is in vid-meta-info/)
// VJ file is one folder deeper (vj-view-panel-logic/), so "../../movie-row"
import MovieRow from "../../movie-row"


const norm = (s: string) => String(s || "").trim().toLowerCase()


// ⚠️ CHANGE THIS if your logo lives elsewhere: /logo.png, /images/ug-logo.png, etc.
const UG_LOGO = "/logo.png"


// Public read API — same D1 source Edit saves to. No hardcode here.
const API_URL = "https://movie-server-api.connectu89.workers.dev/api/movies"


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
  const [showFaq, setShowFaq] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)


  // TRUE VJ — same source + same key as FadersTiles (useFaderData).
  // Faders: vjs = Set( String(m.vj).trim().toLowerCase() ) from useGlobalSearch().allMovies
  // Panel MUST use that exact list/key, not useMovieStore, not NFKD, not vjName.
  // FIX: getSnapshot loop — never return a new array from a Zustand selector.
  const store = useGlobalSearch() as any
  const allMovies: any[] = useMemo(() => {
    const list = store?.allMovies || []
    return Array.isArray(list) ? list : []
  }, [store?.allMovies])


  const vjMovies = useMemo(() => {
    const target = String(vj?.name || "").trim().toLowerCase()
    if (!target) return []
    return allMovies.filter((m: any) => String(m?.vj || "").trim().toLowerCase() === target)
  }, [allMovies, vj?.name])


  // ===== REAL SLOGAN — TRUE IN D1, FALLBACK TO HARDCODED ONLY IF D1 HAS NONE =====
  // Priority:
  // 1. vj.slogan passed in (if panel opener already had it)
  // 2. Any movie for this VJ in allMovies with vj_slogan (Edit backfills it to ALL his movies)
  // 3. Fresh fetch from API_URL (in case allMovies is stale / cached before you saved)
  // 4. Fallback: sloganForVJ() hardcoded — only if D1 has nothing yet
  const [fetchedSlogan, setFetchedSlogan] = useState("")


  const d1SloganFromStore = useMemo(() => {
    const fromProp = String(vj?.slogan || vj?.vj_slogan || "").trim()
    if (fromProp) return fromProp
    for (const m of vjMovies) {
      const s = String(m?.vj_slogan || m?.slogan || "").trim()
      if (s) return s
    }
    return ""
  }, [vj?.slogan, vj?.vj_slogan, vjMovies])


  useEffect(() => {
    const target = norm(vj?.name)
    if (!target) return
    // Already have real slogan from store — no fetch needed
    if (d1SloganFromStore) {
      setFetchedSlogan("")
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-store" })
        const data = await res.json().catch(() => null)
        const list: any[] = Array.isArray(data) ? data : data?.movies || data?.data || []
        for (const m of list) {
          if (norm(m?.vj) !== target) continue
          const s = String(m?.vj_slogan || m?.slogan || "").trim()
          if (s && !cancelled) {
            setFetchedSlogan(s)
            return
          }
        }
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, [vj?.name, d1SloganFromStore])


  const hardcodedFallback = sloganForVJ(vj?.name, vj?.slogan)
  const slogan = d1SloganFromStore || fetchedSlogan || hardcodedFallback
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
            <p className="vj-tip-kicker">Did you enjoy the movie?</p>
            <p className="vj-tip-line">A small tip keeps the best voice in Uganda going. <strong>100% goes to {vj?.name}.</strong></p>
          </div>
          <button type="button" className="vj-tip-cta" onClick={() => setShowTip(true)}>😍 Tip {vj?.name}</button>
        </div>
      ) : (
        <VJWallet vjName={vj?.name} onClose={() => setShowTip(false)} />
      )}


      {/* 2. ROW BELOW — exact same pattern as ActorViewBody:
          the app's own row + cards, not custom cards.
          Actor: <div onClickCapture={() => onClose?.()}><MovieRow title={`${actor.name} movies`} movies={movies} /></div>
          VJ: same, plus ONE guard actor doesn't need — tapping the VJ label INSIDE
          a card must NOT close this panel (it would close + reopen the same VJ). */}
      {vjMovies.length > 0 && (
        <div
          onClickCapture={(e) => {
            if ((e.target as HTMLElement).closest(".l-card-vj-on")) return
            onClose()
          }}
        >
          <MovieRow title={`${vj?.name} movies`} movies={vjMovies} />
        </div>
      )}
      <div style={{ height: 12 }} />
    </div>
  )
}

