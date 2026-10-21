"use client"
import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import "./footer-info.css"
import { useFooterSheet } from "@/stores/use-footer-sheet"

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "accounts", label: "Accounts" },
  { id: "contact", label: "Contact Us" },
  { id: "faq", label: "FAQ" },
  { id: "help", label: "Help" },
  { id: "movies", label: "Movies" },
  { id: "previews", label: "Previews" },
  { id: "report", label: "Report a Problem" },
  { id: "signup", label: "Sign Up" },
  { id: "terms", label: "Terms" },
]

function DetailSheet() {
  const { isOpen, activeId, detail, close } = useFooterSheet() as any
  if (!isOpen) return null
  return (
    <div className="footer-sheet-overlay" onClick={close}>
      <div className="footer-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="footer-sheet-handle" />
        <div className="footer-sheet-header">
          <h3>{activeId?.toUpperCase()}</h3>
          <button onClick={close} className="footer-sheet-close">✕</button>
        </div>
        <div className="footer-sheet-body">
          <p>{detail || "Detailed info about " + activeId + " will appear here. This is TikTok-style bottom sheet."}</p>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 12, opacity: 0.7 }}>More details, actions, or external links can go here.</p>
            <button className="info-detail-btn" onClick={close}>Got it</button>
          </div>
        </div>
      </div>
      <style>{`
  /* UG CONNECT DNA - same as dots-panel + footer */
  .footer-sheet-overlay {
    position: fixed;
    inset: 0;
    background: hsla(var(--bg), 0.55);
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    z-index: 9998;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    animation: dotsFadeIn 0.2s ease;
  }
  .footer-sheet {
    width: 100%;
    max-width: 600px;
    background: hsl(var(--bg));
    border-top: 1px solid hsl(var(--border));
    border-radius: 16px 16px 0 0;
    padding: 8px 0 calc(12px + env(safe-area-inset-bottom));
    z-index: 9999;
    animation: dotsSlideUp 0.32s cubic-bezier(0.16,1,0.3,1);
    max-height: 88vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    box-shadow: 0 -10px 40px hsla(var(--bg), 0.5);
  }
  .footer-sheet::-webkit-scrollbar { display: none; }
  .footer-sheet-handle {
    width: 36px;
    height: 4px;
    background: hsl(var(--border));
    border-radius: 10px;
    margin: 6px auto 12px;
  }
  .footer-sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    margin-bottom: 8px;
  }
  .footer-sheet-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: hsl(var(--text));
    letter-spacing: -0.1px;
  }
  .footer-sheet-close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: hsl(var(--surface));
    border: 1px solid hsl(var(--border));
    color: hsl(var(--text));
    display: grid;
    place-items: center;
    cursor: pointer;
  }
  .footer-sheet-body {
    padding: 0 16px;
    font-size: 13px;
    line-height: 1.6;
    color: hsl(var(--text));
  }
  .footer-sheet-body .info-detail-btn {
    background: hsl(var(--surface));
    border: 1px solid hsl(var(--border));
    border-radius: 12px;
    color: hsl(var(--text));
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    width: 100%;
    margin-top: 12px;
  }
  @keyframes dotsSlideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  @keyframes dotsFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`}</style>

    </div>
  )
}

export default function InfoPage() {
  const search = useSearchParams()
  const initial = search.get("section") || "about"
  const [active, setActive] = useState(initial)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const { open } = useFooterSheet() as any

  // Scroll to section on mount if ?section=xxx
  useEffect(() => {
    const el = sectionRefs.current[initial]
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 200)
    }
  }, [initial])

  // Intersection observer for auto chip update
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            setActive(id)
            // Auto scroll chip into view
            document.getElementById(`chip-${id}`)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
          }
        })
      },
      { rootMargin: "-70px 0px -60% 0px", threshold: 0.1 }
    )
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" })
    setActive(id)
  }

  return (
    <div className="info-page-root">
      <div className="info-chips-wrap">
        <div className="info-chips-scroll">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              id={`chip-${s.id}`}
              className={`info-chip ${active === s.id ? "active" : ""}`}
              onClick={() => scrollTo(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="info-sections">
        {/* ABOUT */}
        <section id="about" ref={(el) => { sectionRefs.current["about"] = el }} className="info-section">
          <h2>About UG Connect</h2>
          <p>UG Connect is a Ugandan streaming platform for VJ-translated movies, series, and previews. Built by DOPE TONE to bring cinema closer to every Ugandan.</p>
          <button className="info-detail-btn" onClick={() => open("about", "UG Connect was founded to preserve VJ culture and make movies accessible on low data. We support local VJs, creators, and studios.")}>View details →</button>
        </section>

        <section id="accounts" ref={(el) => { sectionRefs.current["accounts"] = el }} className="info-section">
          <h2>Accounts</h2>
          <p>Manage your account, login, verification, and subscriptions. Your watch history, My List, and progress are synced per device.</p>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            <li>Sign in with Google or email</li>
            <li>Guest mode supported</li>
            <li>Logout clears local session</li>
          </ul>
          <button className="info-detail-btn" onClick={() => open("accounts", "Account types: Guest (local only), Verified (email/Google). Data stored in localStorage + cloud worker for comments/shares.")}>Account details →</button>
        </section>

        <section id="contact" ref={(el) => { sectionRefs.current["contact"] = el }} className="info-section">
          <h2>Contact Us</h2>
          <p>Reach us for partnerships, VJ applications, or support.</p>
          <p style={{ marginTop: 8 }}><strong>Email:</strong> support@ugconnect.ug<br/><strong>WhatsApp:</strong> +256 700 000000<br/><strong>Location:</strong> Kampala, Uganda</p>
          <button className="info-detail-btn" onClick={() => open("contact", "Response time: 24-48h. For VJ applications, send sample translation + ID.")}>Contact details →</button>
        </section>

        <section id="faq" ref={(el) => { sectionRefs.current["faq"] = el }} className="info-section">
          <h2>FAQ</h2>
          <p><strong>Why preview not showing?</strong> Some series (like Peaky Blinders) have no trailer, only episodes. We fallback to first episode preview.</p>
          <p><strong>Can I download?</strong> Downloads are coming soon.</p>
          <button className="info-detail-btn" onClick={() => open("faq", "Full FAQ: How to save to My List, how auto-scroll works, how to report, how to change VJ.")}>Full FAQ →</button>
        </section>

        <section id="help" ref={(el) => { sectionRefs.current["help"] = el }} className="info-section">
          <h2>Help Center</h2>
          <p>Need help with playback, buffering, or controls? Try clearing cache, checking network, or switching quality.</p>
          <button className="info-detail-btn" onClick={() => open("help", "Playback tips: Tap video to show/hide controls, double tap to fit cover/contain, use quality sheet for 4K/1080p.")}>Help details →</button>
        </section>

        <section id="movies" ref={(el) => { sectionRefs.current["movies"] = el }} className="info-section">
          <h2>Movies</h2>
          <p>Browse action, drama, crime, horror, romance, and more. Filter by genre, VJ, or year.</p>
          <button className="info-detail-btn" onClick={() => open("movies", "Movies are fetched from movie-server-api.connectu89.workers.dev. Each movie has cover, video_url, preview, VJ, genre.")}>How movies work →</button>
        </section>

        <section id="previews" ref={(el) => { sectionRefs.current["previews"] = el }} className="info-section">
          <h2>Previews / Reels</h2>
          <p>Vertical reels like TikTok. Auto-scroll, like, comment, share, and tap Watch Full Movie to open full player.</p>
          <button className="info-detail-btn" onClick={() => open("previews", "Reels feed uses IntersectionObserver for active detection. Preview URL resolved from preview_urls, preview_url, trailer_url, or first episode.")}>Reels logic →</button>
        </section>

        <section id="report" ref={(el) => { sectionRefs.current["report"] = el }} className="info-section">
          <h2>Report a Problem</h2>
          <p>Found wrong VJ, bad video, or offensive content? Use the ••• menu → Report.</p>
          <button className="info-detail-btn" onClick={() => open("report", "Report goes to /report?movieId=&type=reel. We review within 48h.")}>Report flow →</button>
        </section>

        <section id="signup" ref={(el) => { sectionRefs.current["signup"] = el }} className="info-section">
          <h2>Sign Up</h2>
          <p>Create account to save My List, comment, and track progress across devices.</p>
          <button className="info-detail-btn" onClick={() => open("signup", "Sign up via email verification or Google. Guest data migrates on login.")}>Signup details →</button>
        </section>

        <section id="terms" ref={(el) => { sectionRefs.current["terms"] = el }} className="info-section">
          <h2>Terms & Privacy</h2>
          <p>By using UG Connect you agree to our terms. We don't sell data. Videos are licensed from partners.</p>
          <p style={{ marginTop: 8, fontSize: 11, opacity: 0.6 }}>Last updated: May 2025. Contact for full legal doc.</p>
          <button className="info-detail-btn" onClick={() => open("terms", "Full terms: No redistribution, no screen recording for commercial use, respect VJ credits.")}>Full terms →</button>
        </section>
      </div>

      <DetailSheet />
    </div>
  )
}

