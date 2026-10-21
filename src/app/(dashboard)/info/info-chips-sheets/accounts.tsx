"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { getPricing, getPaygPricing } from "./currency-map-calculater"

const ALL_VJS = ["VJ JUNIOR","VJ JINGO","VJ ICE P","VJ EMMY","VJ KEVO","VJ MUBA","VJ LITTLE T","VJ HD","VJ MARK"]

export function Tile({ open, sectionRef, id="accounts" }: any) {
  const isAccounts = true // dedicated accounts file
  const [p, setP] = useState({ monthlyFormatted: "AED 10", yearlyFormatted: "AED 100", saveFormatted: "AED 20", currency: "AED", region: "AE" } as any)
  const [payg, setPayg] = useState({ formatted: "AED 4", movies: 5 } as any)
  useEffect(() => { try { setP(getPricing()); setPayg(getPaygPricing()) } catch {} }, [])
  
  if (!isAccounts) {
    return (
      <section id={id} ref={sectionRef} className="info-section">
        <h2>Sign Up</h2>
        <p>Unlock PRO {p.monthlyFormatted}/mo or PRO PLUS {p.yearlyFormatted} save {p.saveFormatted}. Or PAYG {payg.formatted} = {payg.movies} movies.</p>
        <button className="info-detail-btn" onClick={() => open(id)}>Sign up options →</button>
      </section>
    )
  }

  return (
    <section id={id} ref={sectionRef} className="info-section" style={{
      background: 'linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--bg)) 100%)',
      border: '1px solid hsl(var(--border))',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'radial-gradient(circle, rgba(255,193,7,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <img src="/logo.png" alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} onError={(e:any)=>e.target.style.display='none'} />
        <div>
          <h2 style={{ margin: 0, fontSize: 15 }}>Accounts</h2>
          <p style={{ margin: 0, fontSize: 10, opacity: 0.6 }}>{p.currency} • PRO {p.monthlyFormatted} • PRO PLUS {p.yearlyFormatted}</p>
        </div>
      </div>
      <p style={{ fontSize: 12.5, lineHeight: 1.4, marginBottom: 8 }}>4 account types — same as Subscriptions sheet. Accurate pricing.</p>
      <div style={{ display: 'grid', gap: 5 }}>
        <div style={{ display: 'flex', gap: 6, fontSize: 10.5, background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '5px 8px' }}>
          <span>👁️</span><span><strong>Guest</strong> — Previews only — Free</span>
        </div>
        <div style={{ display: 'flex', gap: 6, fontSize: 10.5, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '5px 8px' }}>
          <span>⚡</span><span><strong>PAYG</strong> — {payg.formatted} = {payg.movies} movies instant — Greatest</span>
        </div>
        <div style={{ display: 'flex', gap: 6, fontSize: 10.5, background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.2)', borderRadius: 8, padding: '5px 8px' }}>
          <span>🔓</span><span><strong>PRO</strong> — {p.monthlyFormatted}/Mo — Most Popular</span>
        </div>
        <div style={{ display: 'flex', gap: 6, fontSize: 10.5, background: '#FFC107', color: '#000', borderRadius: 8, padding: '5px 8px', fontWeight: 700 }}>
          <span>👑</span><span><strong>PRO PLUS</strong> — {p.yearlyFormatted}/Yr save {p.saveFormatted} — Best Value</span>
        </div>
      </div>
      <button className="info-detail-btn" onClick={() => open(id)} style={{ marginTop: 10 }}>See accurate breakdown →</button>
    </section>
  )
}

export default function Sheet({ id="signup" }: any) {
  const router = useRouter()
  const [p, setP] = useState({ monthlyFormatted: "AED 10", yearlyFormatted: "AED 100", saveFormatted: "AED 20", currency: "AED", region: "AE", symbol: "AED" } as any)
  const [payg, setPayg] = useState({ formatted: "AED 4", amount: 4, movies: 5 } as any)
  
  const vjs = useMemo(()=>[...ALL_VJS].sort(()=>0.5-Math.random()).slice(0,3),[])
  const vjsPlus = useMemo(()=>[...ALL_VJS].sort(()=>0.5-Math.random()).slice(0,3),[])

  useEffect(() => { try { setP(getPricing()); setPayg(getPaygPricing()) } catch {} }, [])

  if (id !== "accounts") {
    return (
      <div className="footer-sheet-body" style={{ padding: '16px' }}>
        <p>PRO {p.monthlyFormatted}/Mo • PRO PLUS {p.yearlyFormatted}/Yr save {p.saveFormatted} • PAYG {payg.formatted} = {payg.movies} movies</p>
      </div>
    )
  }

  return (
    <div className="footer-sheet-body" style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
        <span>📍 {p.region} • {p.currency} • Auto from subscriptions-sheet</span>
        <span style={{ opacity: 0.6 }}>Accurate • Live pricing</span>
      </div>

      {/* Guest */}
      <div style={{ background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
          <span>👁️</span><strong style={{ fontSize: 12 }}>GUEST</strong><span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}>FREE</span>
        </div>
        <p style={{ fontSize: 11, opacity: 0.8 }}><strong>Can do:</strong> Watch previews, trailers, reels only. Browse movies & VJs. No full movies.</p>
      </div>

      {/* PAYG */}
      <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, hsl(var(--bg)) 100%)', border: '1.5px solid #22c55e', borderRadius: 12, padding: 12, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -8, right: 10, background: '#22c55e', color: 'white', fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 99 }}>⚡ PAY AS YOU GO • GREATEST</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, marginBottom: 6 }}>
          <strong style={{ fontSize: 12 }}>PAYG • {payg.movies} Movies</strong>
          <strong style={{ fontSize: 12, color: '#22c55e' }}>{payg.formatted} • ~$1</strong>
        </div>
        <p style={{ fontSize: 11, lineHeight: 1.4 }}><strong>Can do:</strong> Pay {payg.formatted} once, watch {payg.movies} full movies instantly. No subscription, no monthly bill. Keep My List for those {payg.movies}. Perfect for tonight.</p>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <div style={{ flex: 1, background: 'hsl(var(--bg))', borderRadius: 6, padding: 6, textAlign: 'center' }}><div style={{ fontSize: 9, opacity: 0.6 }}>YOU PAY</div><div style={{ fontSize: 12, fontWeight: 800, color: '#22c55e' }}>{payg.formatted}</div></div>
          <div style={{ flex: 1, background: 'hsl(var(--bg))', borderRadius: 6, padding: 6, textAlign: 'center' }}><div style={{ fontSize: 9, opacity: 0.6 }}>YOU GET</div><div style={{ fontSize: 12, fontWeight: 800 }}>{payg.movies} Movies</div></div>
        </div>
      </div>

      {/* PRO - from SubscriptionsSheet - ACCURATE */}
      <div style={{ background: 'linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--bg)) 100%)', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 12, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -8, left: 12, background: 'hsl(var(--text))', color: 'hsl(var(--bg))', fontSize: 8, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>{p.currency} • MOST POPULAR</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>PRO</h3>
          <div><span style={{ fontSize: 14, fontWeight: 800 }}>{p.monthlyFormatted}</span><small style={{ fontSize: 10, opacity: 0.6 }}>/Mo.</small></div>
        </div>
        <p style={{ fontSize: 11, lineHeight: 1.4, marginBottom: 8 }}>Watch <b>unlimited movies & series</b> translated by your favourite VJs. Luganda commentary, no buffering, first to get fresh releases. Your cinema, your language.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10.5 }}>
          <div>✓ Watch without Ads</div>
          <div>✓ Unlimited VJ Translations</div>
          <div>✓ 4K & Early Access</div>
        </div>
        <div style={{ display: 'flex', gap: -6, marginTop: 8 }}>
          {vjs.map((v,i)=>(
            <div key={v} style={{ width: 28, height: 28, borderRadius: '50%', background: 'hsl(var(--surface))', border: '2px solid hsl(var(--bg))', display: 'grid', placeItems: 'center', fontSize: 7, fontWeight: 700, marginLeft: i>0?-6:0, zIndex: 3-i }}>{v.replace("VJ ","").slice(0,4)}</div>
          ))}
          <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 8, alignSelf: 'center' }}>VJ Junior, Jingo, Ice P etc.</span>
        </div>
      </div>

      {/* PRO PLUS - ACCURATE */}
      <div style={{ background: 'linear-gradient(135deg, rgba(255,193,7,0.12) 0%, hsl(var(--bg)) 100%)', border: '1.5px solid #FFC107', borderRadius: 12, padding: 12, position: 'relative', boxShadow: '0 4px 20px rgba(255,193,7,0.12)' }}>
        <div style={{ position: 'absolute', top: -8, left: 12, background: '#FFC107', color: '#000', fontSize: 8, fontWeight: 800, padding: '2px 8px', borderRadius: 99 }}>BEST VALUE • SAVE {p.saveFormatted}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>PRO <span style={{ background: '#FFC107', padding: '1px 4px', borderRadius: 4, fontSize: 10 }}>PLUS</span></h3>
          <div><span style={{ fontSize: 14, fontWeight: 800 }}>{p.yearlyFormatted}</span><small style={{ fontSize: 10, opacity: 0.6 }}>/Yr.</small></div>
        </div>
        <p style={{ fontSize: 11, lineHeight: 1.4, marginBottom: 8 }}>Everything in PRO, plus <b>all-year access for price of 10 months</b>. Lock your price, offline downloads & family sharing.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10.5 }}>
          <div>✓ All PRO Features Included</div>
          <div>✓ Offline Downloads + Family Share</div>
          <div>✓ Lock Price</div>
        </div>
        <div style={{ display: 'flex', gap: -6, marginTop: 8 }}>
          {vjsPlus.map((v,i)=>(
            <div key={v} style={{ width: 28, height: 28, borderRadius: '50%', background: '#FFC107', color: '#000', border: '2px solid hsl(var(--bg))', display: 'grid', placeItems: 'center', fontSize: 7, fontWeight: 700, marginLeft: i>0?-6:0, zIndex: 3-i }}>{v.replace("VJ ","").slice(0,4)}</div>
          ))}
          <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 8, alignSelf: 'center' }}>Best value • Save {p.saveFormatted}</span>
        </div>
      </div>

      <div style={{ background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))', borderLeft: '3px solid #4CAF50', borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8 }}>
        <span>🕊️</span>
        <div><strong style={{ fontSize: 11 }}>You can leave anytime — no hard feelings.</strong><p style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>Guest close, PAYG no renewal, PRO/PRO PLUS cancel 1 tap. Family door stays open.</p></div>
      </div>

      <button onClick={()=>{ const el=document.getElementById('contact'); if(el) el.scrollIntoView({behavior:'smooth'}); else router.push('/info?section=contact') }} style={{ width: '100%', background: 'hsl(var(--text))', color: 'hsl(var(--bg))', border: 'none', borderRadius: 12, padding: '12px', fontSize: 12, fontWeight: 600 }}>Need more help? →</button>
      <p style={{ fontSize: 9, opacity: 0.4, textAlign: 'center' }}>Accurate with SubscriptionsSheet • PRO {p.monthlyFormatted}/Mo • PRO PLUS {p.yearlyFormatted}/Yr • PAYG {payg.formatted} = {payg.movies} movies • {p.currency}</p>
    </div>
  )
}

