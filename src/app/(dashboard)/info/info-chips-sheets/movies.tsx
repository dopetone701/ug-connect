"use client"
import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getPricing, getPaygPricing } from "./currency-map-calculater"

const GENRES = ["Action","Drama","Crime","Horror","Romance","Comedy","Sci-Fi","Thriller","Family"]
const VJS = ["VJ Junior","VJ Jingo","VJ Ice P","VJ Emmy","VJ Kevo","VJ Muba"]

export function Tile({ open, sectionRef }: any) {
  return (
    <section id="movies" ref={sectionRef} className="info-section" style={{
      background: 'linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--bg)) 100%)',
      border: '1px solid hsl(var(--border))',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'radial-gradient(circle, rgba(255,193,7,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#111', border: '1px solid rgba(255,193,7,0.2)', display: 'grid', placeItems: 'center', fontSize: 16 }}>🎬</div>
        <h2 style={{ margin: 0, fontSize: 15 }}>Movies</h2>
      </div>
      <p style={{ fontSize: 12.5, lineHeight: 1.5 }}>1000+ movies translated in Luganda by your favourite VJs. Action, drama, horror — all with our vibe.</p>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        {GENRES.slice(0,4).map(g=>(
          <span key={g} style={{ fontSize: 9, padding: '3px 7px', borderRadius: 99, background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))' }}>{g}</span>
        ))}
        <span style={{ fontSize: 9, padding: '3px 7px', borderRadius: 99, background: '#FFC107', color: '#000', fontWeight: 700 }}>+ {GENRES.length-4} more</span>
      </div>
      <button className="info-detail-btn" onClick={() => open("movies")} style={{ marginTop: 10 }}>How movies work →</button>
    </section>
  )
}

export default function Sheet() {
  const router = useRouter()
  const [p, setP] = useState({ monthlyFormatted: "AED 10", currency: "AED" } as any)
  const [payg, setPayg] = useState({ formatted: "AED 4", movies: 5 } as any)
  useEffect(()=>{ try{ setP(getPricing()); setPayg(getPaygPricing()) }catch{} }, [])
  const randomVjs = useMemo(()=>[...VJS].sort(()=>0.5-Math.random()).slice(0,3),[])

  return (
    <div className="footer-sheet-body" style={{ padding: '16px 16px 36px', display: 'flex', flexDirection: 'column', gap: 16 }}>

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
          <img src="/logo.png" alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} onError={(e:any)=>e.target.style.display='none'} />
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'white' }}>Movies — Luganda First</h2>
            <p style={{ margin: 0, fontSize: 10, opacity: 0.6, color: 'white' }}>VJ voices you grew up with • HD • No buffering</p>
          </div>
        </div>
        <p style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 10, opacity: 0.85, color: 'white' }}>
          Every movie here is translated by our VJs — they add Luganda jokes, proverbs, gossip. Hollywood action becomes your uncle's story. That's why you feel at home.
        </p>
      </div>

      {/* What you get */}
      <div>
        <strong style={{ fontSize: 12 }}>🎥 What We Have</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>🔥</div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>1000+ Movies</div>
            <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>Action, drama, crime, horror, romance, comedy...</div>
          </div>
          <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>🎙️</div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>{VJS.length}+ VJs</div>
            <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>Junior, Jingo, Ice P, Emmy... your favourites</div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 12 }}>
        <strong style={{ fontSize: 12 }}>⚙️ How Movies Work</strong>
        <p style={{ fontSize: 11, lineHeight: 1.6, marginTop: 6, opacity: 0.85 }}>
          Movies come from our secure server — each has cover, trailer (preview/reel), full video, VJ name, genre, year, description. You tap card → watch preview → hit Watch.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 8, fontSize: 10.5 }}><span style={{ width: 18, height: 18, borderRadius: '50%', background: '#111', color: 'white', display: 'grid', placeItems: 'center', fontSize: 9 }}>1</span><span><strong>Browse:</strong> Home feed, search, filter by genre/VJ/year</span></div>
          <div style={{ display: 'flex', gap: 8, fontSize: 10.5 }}><span style={{ width: 18, height: 18, borderRadius: '50%', background: '#111', color: 'white', display: 'grid', placeItems: 'center', fontSize: 9 }}>2</span><span><strong>Preview:</strong> 30-sec trailer with VJ voice — free for Guest</span></div>
          <div style={{ display: 'flex', gap: 8, fontSize: 10.5 }}><span style={{ width: 18, height: 18, borderRadius: '50%', background: '#FFC107', color: '#000', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 800 }}>3</span><span><strong>Watch:</strong> Full movie — needs PAYG {payg.formatted} or PRO {p.monthlyFormatted}</span></div>
        </div>
      </div>

      {/* Genres */}
      <div>
        <strong style={{ fontSize: 12 }}>🎭 Genres & VJs</strong>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {GENRES.map(g=>(
            <span key={g} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 99, background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}>{g}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {randomVjs.map(v=>(
            <span key={v} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 99, background: '#111', color: 'white', border: '1px solid rgba(255,193,7,0.2)' }}>{v}</span>
          ))}
          <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 99, background: 'rgba(255,193,7,0.12)', border: '1px solid rgba(255,193,7,0.25)' }}>+ more VJs</span>
        </div>
      </div>

      {/* How to watch with accounts */}
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>👁️</span><div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700 }}>Guest</div><div style={{ fontSize: 10, opacity: 0.6 }}>Previews only — free</div></div><span style={{ fontSize: 10, opacity: 0.6 }}>Free</span>
        </div>
        <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>⚡</span><div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700 }}>PAYG • {payg.formatted} = {payg.movies} movies</div><div style={{ fontSize: 10, opacity: 0.6 }}>Pay once, watch instantly tonight</div></div><span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e' }}>{payg.formatted}</span>
        </div>
        <div style={{ background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.2)', borderRadius: 10, padding: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>🔓</span><div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700 }}>PRO • Unlimited</div><div style={{ fontSize: 10, opacity: 0.6 }}>{p.monthlyFormatted}/mo • No ads • My List • History</div></div><span style={{ fontSize: 11, fontWeight: 700 }}>{p.monthlyFormatted}</span>
        </div>
      </div>

      {/* Features */}
      <div style={{ background: 'linear-gradient(135deg, rgba(255,193,7,0.06) 0%, hsl(var(--surface)) 100%)', border: '1px solid rgba(255,193,7,0.15)', borderRadius: 12, padding: 12 }}>
        <strong style={{ fontSize: 11.5 }}>✨ What You Can Do Inside Movies</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}><span>✅</span><span><strong>My List:</strong> Save movies, watch later, synced if PRO</span></div>
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}><span>✅</span><span><strong>Continue Watching:</strong> Resume where you stopped</span></div>
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}><span>✅</span><span><strong>Reels:</strong> Swipe previews like TikTok</span></div>
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}><span>✅</span><span><strong>Share:</strong> Send movie link to friends • 5 friends = 10 free movies</span></div>
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}><span>✅</span><span><strong>Low data:</strong> Auto quality, respects UG bundles</span></div>
        </div>
      </div>

      <div style={{ background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))', borderLeft: '3px solid #FFC107', borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8 }}>
        <span>💡</span>
        <div><strong style={{ fontSize: 11 }}>Tip from VJ:</strong><p style={{ fontSize: 10.5, opacity: 0.7, marginTop: 2 }}>Start with preview — if VJ voice makes you laugh in 10 seconds, that's your movie tonight.</p></div>
      </div>

      <button onClick={()=>{ router.push('/') }} style={{ width: '100%', background: '#111', color: 'white', border: '1px solid rgba(255,193,7,0.2)', borderRadius: 12, padding: '12px', fontSize: 12, fontWeight: 700 }}>Browse Movies Now →</button>
      <p style={{ fontSize: 9, opacity: 0.4, textAlign: 'center' }}>Movies from our server • VJ translations • {p.currency} • PAYG {payg.formatted} = {payg.movies} movies • UG Community © 2025</p>
    </div>
  )
}

