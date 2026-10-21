"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getPricing, getPaygPricing } from "./currency-map-calculater"

export function Tile({ open, sectionRef, id="signup" }: any) {
  const [p, setP] = useState({ monthlyFormatted: "AED 10", yearlyFormatted: "AED 100", saveFormatted: "AED 20", currency: "AED" } as any)
  const [payg, setPayg] = useState({ formatted: "AED 4", movies: 5 } as any)
  useEffect(() => { try { setP(getPricing()); setPayg(getPaygPricing()) } catch {} }, [])

  return (
    <section id={id} ref={sectionRef} className="info-section" style={{
      background: 'linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--bg)) 100%)',
      border: '1px solid hsl(var(--border))',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'radial-gradient(circle, rgba(255,193,7,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#111', border: '1px solid rgba(255,193,7,0.2)', display: 'grid', placeItems: 'center', fontSize: 16 }}>✨</div>
        <h2 style={{ margin: 0, fontSize: 15 }}>Sign Up</h2>
      </div>
      <p style={{ fontSize: 12.5, lineHeight: 1.5 }}>Join in 10 sec — Google, Apple or email. Guest to PRO in 1 tap. {p.monthlyFormatted}/mo or {p.yearlyFormatted} save {p.saveFormatted} or PAYG {payg.formatted}={payg.movies} movies.</p>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))' }}>⚡ 10 sec</span>
        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: '#FFC107', color: '#000', fontWeight: 700 }}>🔓 PRO {p.monthlyFormatted}</span>
      </div>
      <button className="info-detail-btn" onClick={() => open(id)} style={{ marginTop: 10 }}>Sign up options →</button>
    </section>
  )
}

export default function Sheet({ id="signup" }: any) {
  const router = useRouter()
  const [p, setP] = useState({ monthlyFormatted: "AED 10", yearlyFormatted: "AED 100", saveFormatted: "AED 20", currency: "AED" } as any)
  const [payg, setPayg] = useState({ formatted: "AED 4", movies: 5 } as any)
  useEffect(() => { try { setP(getPricing()); setPayg(getPaygPricing()) } catch {} }, [])

  return (
    <div className="footer-sheet-body" style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        background: 'linear-gradient(135deg, #111 0%, #1a1a1a 40%, #222 100%)',
        border: '1px solid rgba(255,193,7,0.15)',
        borderRadius: 16,
        padding: '16px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'radial-gradient(circle, rgba(255,193,7,0.18) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', position: 'relative' }}>
          <img src="/logo.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} onError={(e:any)=>e.target.style.display='none'} />
          <div>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'white' }}>Sign Up — 10 Seconds</h2>
            <p style={{ margin: 0, fontSize: 10, opacity: 0.6, color: 'white' }}>Google • Apple • Email • Or continue as Guest</p>
          </div>
        </div>
        <p style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 10, opacity: 0.85, color: 'white' }}>
          Tap Sign In — quick. No long forms. Guest? Keep browsing previews free. Want full? Pick PAYG {payg.formatted}={payg.movies} movies for tonight or PRO {p.monthlyFormatted}/mo unlimited.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: 10, display: 'flex', gap: 10 }}>
          <span>⚡</span><div><div style={{ fontSize: 11, fontWeight: 700 }}>Fast sign-in</div><div style={{ fontSize: 10, opacity: 0.6 }}>Google, Apple, Email — 1 tap, no password stress</div></div>
        </div>
        <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: 10, display: 'flex', gap: 10 }}>
          <span>👁️</span><div><div style={{ fontSize: 11, fontWeight: 700 }}>Continue as Guest</div><div style={{ fontSize: 10, opacity: 0.6 }}>Previews, trailers, reels — free, no account needed</div></div>
        </div>
        <div style={{ background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.2)', borderRadius: 10, padding: 10, display: 'flex', gap: 10 }}>
          <span>🔓</span><div><div style={{ fontSize: 11, fontWeight: 700 }}>Upgrade anytime</div><div style={{ fontSize: 10, opacity: 0.6 }}>Guest → PAYG {payg.formatted} → PRO {p.monthlyFormatted} → PLUS {p.yearlyFormatted} save {p.saveFormatted}</div></div>
        </div>
      </div>

      <button onClick={()=>router.push('/')} style={{ width: '100%', background: '#FFC107', color: '#000', border: 'none', borderRadius: 12, padding: '14px', fontSize: 13, fontWeight: 800 }}>Sign Up Now →</button>
      <p style={{ fontSize: 9, opacity: 0.4, textAlign: 'center' }}>UG Connect • 10 sec sign up • {p.currency} • PRO {p.monthlyFormatted} • PAYG {payg.formatted} • © 2025</p>
    </div>
  )
}

