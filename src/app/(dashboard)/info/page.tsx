"use client"
import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import "./footer-info.css"
import { useFooterSheet } from "@/stores/use-footer-sheet"

// Safe imports - each file handles its own tile + sheet
import * as AboutMod from "./info-chips-sheets/about-ug-connect"
import * as ContactMod from "./info-chips-sheets/contact-us"
import * as FaqMod from "./info-chips-sheets/faq"
import * as HelpMod from "./info-chips-sheets/help-center"
import * as MoviesMod from "./info-chips-sheets/movies"
import * as PreviewsMod from "./info-chips-sheets/previes-reels"
import * as ReportMod from "./info-chips-sheets/report-problem"
import * as SignUpMod from "./info-chips-sheets/sign-up"
import * as AccountsMod from "./info-chips-sheets/accounts"
import * as TermsMod from "./info-chips-sheets/terms-and-privacy"

const getTile = (mod: any) => mod.Tile || mod.default?.Tile || null
const getSheet = (mod: any) => mod.default || mod.Sheet || null

const SECTIONS = [
  { id: "about", label: "About", Tile: getTile(AboutMod), Sheet: getSheet(AboutMod) },
  { id: "accounts", label: "Accounts", Tile: getTile(AccountsMod), Sheet: getSheet(AccountsMod), tileProps: { id: "accounts" } },
  { id: "contact", label: "Contact Us", Tile: getTile(ContactMod), Sheet: getSheet(ContactMod) },
  { id: "faq", label: "FAQ", Tile: getTile(FaqMod), Sheet: getSheet(FaqMod) },
  { id: "help", label: "Help", Tile: getTile(HelpMod), Sheet: getSheet(HelpMod) },
  { id: "movies", label: "Movies", Tile: getTile(MoviesMod), Sheet: getSheet(MoviesMod) },
  { id: "previews", label: "Previews", Tile: getTile(PreviewsMod), Sheet: getSheet(PreviewsMod) },
  { id: "report", label: "Report a Problem", Tile: getTile(ReportMod), Sheet: getSheet(ReportMod) },
  { id: "signup", label: "Sign Up", Tile: getTile(SignUpMod), Sheet: getSheet(SignUpMod) },
  { id: "terms", label: "Terms", Tile: getTile(TermsMod), Sheet: getSheet(TermsMod) },
]

const SHEET_MAP: Record<string, any> = {
  about: getSheet(AboutMod),
  accounts: getSheet(AccountsMod),
  contact: getSheet(ContactMod),
  faq: getSheet(FaqMod),
  help: getSheet(HelpMod),
  movies: getSheet(MoviesMod),
  previews: getSheet(PreviewsMod),
  report: getSheet(ReportMod),
  signup: getSheet(SignUpMod),
  terms: getSheet(TermsMod),
}

function FallbackTile({ id, label, open, sectionRef }: any) {
  return (
    <section id={id} ref={sectionRef} className="info-section">
      <h2>{label}</h2>
      <p>Details for {label} - file missing Tile export, using fallback.</p>
      <button className="info-detail-btn" onClick={() => open(id)}>View details →</button>
    </section>
  )
}

function DetailSheet() {
  const { isOpen, activeId, detail, close } = useFooterSheet() as any
  if (!isOpen) return null
  const SheetComp = SHEET_MAP[activeId]
  return (
    <div className="footer-sheet-overlay" onClick={close}>
      <div className="footer-sheet" onClick={(e) => e.stopPropagation()}>
        {SheetComp ? <SheetComp detail={detail} close={close} id={activeId} /> : (
          <>
            <div className="footer-sheet-handle" />
            <div className="footer-sheet-header">
              <h3>{activeId?.toUpperCase()}</h3>
              <button onClick={close} className="footer-sheet-close">✕</button>
            </div>
            <div className="footer-sheet-body"><p>{detail}</p></div>
          </>
        )}
      </div>
      <style>{`
  .footer-sheet-overlay {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    bottom: 0;
    background: hsla(var(--bg), 0.55);
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    z-index: 9998;
    display: flex;
    align-items: stretch;
    justify-content: flex-end;
    animation: dotsFadeIn 0.2s ease;
  }
  .footer-sheet {
    width: 100%;
    max-width: 100%;
    height: 100%;
    background: hsl(var(--bg));
    border-left: 1px solid hsl(var(--border));
    border-radius: 0;
    padding: 8px 0 calc(12px + env(safe-area-inset-bottom));
    z-index: 9999;
    animation: dotsSlideLeft 0.32s cubic-bezier(0.32,0.72,0,1);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    box-shadow: -10px 0 40px hsla(var(--bg), 0.5);
  }
  @media (min-width: 768px) {
    .footer-sheet { max-width: 460px; }
  }
  .footer-sheet::-webkit-scrollbar { display: none; }
  .footer-sheet-handle { display: none; }
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
  @keyframes dotsSlideLeft {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
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

  useEffect(() => {
    const el = sectionRefs.current[initial]
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 200)
  }, [initial])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            setActive(id)
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
            <button key={s.id} id={`chip-${s.id}`} className={`info-chip ${active === s.id ? "active" : ""}`} onClick={() => scrollTo(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="info-sections">
        {SECTIONS.map(({ id, Tile, tileProps, label }) => {
          const Comp = Tile || FallbackTile
          return <Comp key={id} sectionRef={(el: any) => { sectionRefs.current[id] = el }} open={open} {...(tileProps || {})} id={id} label={label} />
        })}
      </div>

      <DetailSheet />
    </div>
  )
}

