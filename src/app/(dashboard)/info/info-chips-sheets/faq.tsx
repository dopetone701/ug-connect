"use client"
import { useState, useEffect, useMemo } from "react"
import { getPricing, getPaygPricing } from "./currency-map-calculater"

export const buildFaqData = () => {
  const p = (()=>{ try { return getPricing() } catch { return { monthlyFormatted: "AED 10", yearlyFormatted: "AED 100", saveFormatted: "AED 20", currency: "AED", region: "AE" } } })()
  const payg = (()=>{ try { return getPaygPricing() } catch { return { formatted: "AED 4", movies: 5 } } })()
  
  return [
    {
      q: "What is UG Connect?",
      a: `UG Connect is our own platform — movies translated in Luganda by your favourite VJs. We bring you home when you're far. 1000+ movies, VJ Junior, VJ Jingo, VJ Ice P and more. Built in Kampala, loved worldwide — Dubai, London, Toronto, Kampala. One app, all VJ culture.`,
    },
    {
      q: "What movies do you have?",
      a: `Action, drama, crime, horror, romance, comedy, thriller — all translated with Luganda jokes, proverbs, and our vibe. Each movie has cover, preview/reel (30 sec), full video, VJ name, genre, year. New movies weekly.`,
    },
    {
      q: `How can I watch movies?`,
      a: `4 ways — same as Accounts: Guest (free, previews only), PAYG (pay ${payg.formatted} = ${payg.movies} movies, watch instantly tonight, no monthly bill), PRO (${p.monthlyFormatted}/Mo — unlimited, no ads, My List, history, 4K, early access), PRO PLUS (${p.yearlyFormatted}/Yr save ${p.saveFormatted} — best value, all PRO + full year for price of 10 months, offline downloads, family sharing, price locked).`,
    },
    {
      q: "How much is UG Connect?",
      a: `${p.monthlyFormatted} per month for PRO unlimited, or ${p.yearlyFormatted} per year and save ${p.saveFormatted} — our best value. PAYG ${payg.formatted} = ${payg.movies} movies instantly — greatest for tonight. Pricing shows in your local currency (${p.currency}) auto by location. Base in AED. We also give free: share with 5 friends who sign in = 10 movies free.`,
    },
    {
      q: `What is PAYG ${payg.formatted} = ${payg.movies} movies?`,
      a: `Our greatest offer for tonight. Pay ${payg.formatted} once (~$1), watch ${payg.movies} full movies instantly. No subscription, no renewal. Perfect when you don't want monthly. Like buying data bundle. Your My List keeps those ${payg.movies} movies.`,
    },
    {
      q: "How do I unlock with sharing?",
      a: `3 steps: Tap share, send your personal link to 5 friends, when they sign in, you get 10 movies free automatically. Our thank you for growing the family. Works for Guest too.`,
    },
    {
      q: "How to sign in?",
      a: `Tap Sign In — quick with Google, Apple or email. Or continue as guest to watch previews instantly. Guest data moves when you sign in later. One account per person.`,
    },
    {
      q: "Can I continue as guest?",
      a: `Yes. Guest = free, no sign-in, watch unlimited previews, trailers, reels, browse genres and VJs. No full movies. When ready, sign in to unlock PAYG or PRO.`,
    },
    {
      q: "Can I cancel or leave anytime?",
      a: `Yes — no hard feelings. Guest just close. PAYG no renewal. PRO/PRO PLUS cancel in 1 tap, no questions. Your account stays safe, seat reserved when you return. Family door always open.`,
    },
    {
      q: "13+ allowed? Privacy?",
      a: `13 years and above welcome. Under 13 come with elder. We protect privacy — we never sell data, never keep your card (secure partners handle with strong encryption), minimal data only for history and My List. Delete anytime — we wipe in 7 days. Contact privacy@ugconnect.ug`,
    },
  ]
}

export function Tile({ open, sectionRef }: any) {
  const [pricing, setPricing] = useState(() => {
    try { return getPricing() } catch { return { monthlyFormatted: "AED 10", yearlyFormatted: "AED 100", saveFormatted: "AED 20", currency: "AED", region: "AE" } as any }
  })
  const [payg, setPayg] = useState(() => {
    try { return getPaygPricing() } catch { return { formatted: "AED 4", movies: 5 } as any }
  })
  useEffect(() => {
    try { setPricing(getPricing()); setPayg(getPaygPricing()) } catch {}
  }, [])
  
  return (
    <section id="faq" ref={sectionRef} className="info-section" style={{
      background: 'linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--bg)) 100%)',
      border: '1px solid hsl(var(--border))',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'radial-gradient(circle, rgba(255,193,7,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#111', border: '1px solid rgba(255,193,7,0.2)', display: 'grid', placeItems: 'center', fontSize: 16 }}>❓</div>
        <h2 style={{ margin: 0, fontSize: 15 }}>FAQ</h2>
      </div>
      <p style={{ fontSize: 11, padding: '4px 8px', background: 'rgba(255,193,7,0.12)', borderRadius: 99, display: 'inline-block', border: '1px solid rgba(255,193,7,0.2)', marginBottom: 8 }}>
        💱 {pricing.currency} • PRO {pricing.monthlyFormatted} • PLUS {pricing.yearlyFormatted} • PAYG {payg.formatted}={payg.movies} movies
      </p>
      <p style={{ fontSize: 12.5, lineHeight: 1.5 }}>Quick answers — same pricing as Accounts sheet. Accurate live.</p>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <p style={{ fontSize: 11, opacity: 0.8 }}>• What is UG Connect? — Our own VJ platform</p>
        <p style={{ fontSize: 11, opacity: 0.8 }}>• How much? — {pricing.monthlyFormatted}/mo, {pricing.yearlyFormatted}/yr save {pricing.saveFormatted}, PAYG {payg.formatted}</p>
        <p style={{ fontSize: 11, opacity: 0.8 }}>• Can I leave anytime? — Yes, no hard feelings</p>
      </div>
      <button className="info-detail-btn" onClick={() => open("faq")} style={{ marginTop: 10 }}>Full FAQ →</button>
    </section>
  )
}

export default function Sheet() {
  const [pricing, setPricing] = useState(() => {
    try { return getPricing() } catch { return { monthlyFormatted: "AED 10", yearlyFormatted: "AED 100", saveFormatted: "AED 20", currency: "AED", region: "AE" } as any }
  })
  const [payg, setPayg] = useState(() => {
    try { return getPaygPricing() } catch { return { formatted: "AED 4", movies: 5 } as any }
  })
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  useEffect(() => {
    try { setPricing(getPricing()); setPayg(getPaygPricing()) } catch {}
  }, [])

  const faqData = useMemo(()=>buildFaqData(), [pricing, payg])
  
  return (
    <div className="footer-sheet-body" style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {faqData.map((item: any, idx: number) => (
          <div key={idx} style={{ 
            background: openIdx===idx ? 'linear-gradient(135deg, rgba(255,193,7,0.06) 0%, hsl(var(--surface)) 100%)' : 'hsl(var(--surface))', 
            border: openIdx===idx ? '1px solid rgba(255,193,7,0.2)' : '1px solid hsl(var(--border))', 
            borderRadius: 12, 
            padding: '12px 14px' 
          }}>
            <button 
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              style={{ 
                width: '100%', 
                textAlign: 'left', 
                fontWeight: 700, 
                fontSize: 12.5, 
                display: 'flex', 
                justifyContent: 'space-between',
                gap: 8,
                background: 'none',
                border: 'none',
                color: 'hsl(var(--text))',
                cursor: 'pointer',
                lineHeight: 1.4
              }}
            >
              <span>{item.q}</span>
              <span style={{ transform: openIdx === idx ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', fontSize: 12, opacity: 0.6 }}>⌄</span>
            </button>
            {openIdx === idx && (
              <p style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.6, opacity: 0.9 }}>{item.a}</p>
            )}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 9, opacity: 0.4, textAlign: 'center' }}>UG Connect • {pricing.currency} • PRO {pricing.monthlyFormatted} • PLUS {pricing.yearlyFormatted} • PAYG {payg.formatted} • 13+ • © 2025</p>
    </div>
  )
}

