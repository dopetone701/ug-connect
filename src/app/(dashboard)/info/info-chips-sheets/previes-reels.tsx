"use client"
import { useState, useEffect } from "react"
import { getPricing, getPaygPricing } from "./currency-map-calculater"

export function Tile({ open, sectionRef }: any) {
  return (
    <section id="previews" ref={sectionRef} className="info-section" style={{
      background: 'linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--bg)) 100%)',
      border: '1px solid hsl(var(--border))',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'radial-gradient(circle, rgba(255,193,7,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#111', border: '1px solid rgba(255,193,7,0.2)', display: 'grid', placeItems: 'center', fontSize: 16 }}>🎞️</div>
        <h2 style={{ margin: 0, fontSize: 15 }}>Previews / Reels</h2>
      </div>
      <p style={{ fontSize: 12.5, lineHeight: 1.5 }}>Vertical TikTok-style reels. Swipe, watch 30-sec VJ trailer, tap Watch Full. Auto-scroll, free for Guest.</p>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))' }}>↕️ Swipe</span>
        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: 'rgba(255,193,7,0.12)', border: '1px solid rgba(255,193,7,0.25)' }}>👁️ Free for Guest</span>
        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))' }}>🔁 Auto-scroll</span>
      </div>
      <button className="info-detail-btn" onClick={() => open("previews")} style={{ marginTop: 10 }}>How reels work →</button>
    </section>
  )
}

export default function Sheet() {
  const [p, setP] = useState({ monthlyFormatted: "AED 10" } as any)
  const [payg, setPayg] = useState({ formatted: "AED 4", movies: 5 } as any)
  useEffect(()=>{ try{ setP(getPricing()); setPayg(getPaygPricing()) }catch{} }, [])

  return (
    <div className="footer-sheet-body" style={{ padding: '16px 16px 36px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Hero */}
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
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'white' }}>Previews — Reels</h2>
            <p style={{ margin: 0, fontSize: 10, opacity: 0.6, color: 'white' }}>TikTok vertical • VJ voice in 3 sec • Swipe up</p>
          </div>
        </div>
        <p style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 10, opacity: 0.85, color: 'white' }}>
          Like TikTok but Luganda. Each reel is 30-sec trailer voiced by VJ. Guest watches free unlimited. Want full? Tap Watch Full Movie.
        </p>
      </div>

      {/* How it works */}
      <div style={{ background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 12 }}>
        <strong style={{ fontSize: 12 }}>⚙️ How Reels Work — Tech</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}><span style={{ width: 20, height: 20, borderRadius: '50%', background: '#111', color: 'white', display: 'grid', placeItems: 'center', fontSize: 10 }}>1</span><span><strong>Preview URL:</strong> We try preview_urls[0] → preview_url → trailer_url → video_preview_url → video_url_480 → seasons[0].episodes[0].preview → video_url. Always finds something.</span></div>
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}><span style={{ width: 20, height: 20, borderRadius: '50%', background: '#111', color: 'white', display: 'grid', placeItems: 'center', fontSize: 10 }}>2</span><span><strong>Active detection:</strong> IntersectionObserver 0.75 threshold — video playing only when 75% visible. Saves data.</span></div>
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}><span style={{ width: 20, height: 20, borderRadius: '50%', background: '#FFC107', color: '#000', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 800 }}>3</span><span><strong>Auto-scroll:</strong> Saved in localStorage ugc_auto_scroll. When on, on ended → scrollToNext after 800ms. Listens to storage + custom event ugc_auto_scroll_changed.</span></div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <strong style={{ fontSize: 12 }}>🎛️ What You Can Do in Reels</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 14 }}>❤️</div><div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>Like & Save</div><div style={{ fontSize: 10, opacity: 0.6 }}>Heart count, My List</div>
          </div>
          <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 14 }}>💬</div><div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>Comment</div><div style={{ fontSize: 10, opacity: 0.6 }}>Uses comment panel store</div>
          </div>
          <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 14 }}>🔗</div><div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>Copy Link</div><div style={{ fontSize: 10, opacity: 0.6 }}>Share movie link</div>
          </div>
          <div style={{ background: '#FFC107', borderRadius: 10, padding: 10, color: '#000' }}>
            <div style={{ fontSize: 14 }}>🎬</div><div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>Watch Full</div><div style={{ fontSize: 10, opacity: 0.8 }}>→ /movies/watch/[id]?t=full</div>
          </div>
        </div>
      </div>

      {/* Guest vs Paid */}
      <div style={{ display: 'grid', gap: 6 }}>
        <div style={{ background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: '8px 10px', display: 'flex', gap: 8, fontSize: 11 }}>
          <span>👁️</span><span><strong>Guest:</strong> Unlimited reels/previews free — perfect to test VJ</span>
        </div>
        <div style={{ background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.2)', borderRadius: 10, padding: '8px 10px', display: 'flex', gap: 8, fontSize: 11 }}>
          <span>🔓</span><span><strong>Full movie:</strong> Needs PAYG {payg.formatted} = {payg.movies} movies or PRO {p.monthlyFormatted}</span>
        </div>
      </div>

      <div style={{ background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))', borderLeft: '3px solid #FFC107', borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8 }}>
        <span>💡</span>
        <div><strong style={{ fontSize: 11 }}>Pro tip:</strong><p style={{ fontSize: 10.5, opacity: 0.7, marginTop: 2 }}>If preview says "Preview not available" we show cover + Watch Full button — no blank screen. Dots menu inside reel has Save, Full Movie, View VJ, Copy Link, Report, Hide, Auto-scroll toggle.</p></div>
      </div>

      <p style={{ fontSize: 9, opacity: 0.4, textAlign: 'center' }}>Previews/Reels • Vertical • IntersectionObserver • Auto-scroll localStorage • UG Connect © 2025</p>
    </div>
  )
}

