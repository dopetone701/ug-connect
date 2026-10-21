"use client"
import { useEffect, useState } from "react"
import { getPricing, getPaygPricing } from "./currency-map-calculater"

export function Tile({ open, sectionRef }: any) {
  return (
    <section id="terms" ref={sectionRef} className="info-section" style={{
      background: 'linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--bg)) 100%)',
      border: '1px solid hsl(var(--border))',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'radial-gradient(circle, rgba(255,193,7,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))', display: 'grid', placeItems: 'center', fontSize: 16 }}>📜</div>
        <h2 style={{ margin: 0, fontSize: 15 }}>Terms & Privacy</h2>
      </div>
      <p style={{ fontSize: 12.5, lineHeight: 1.5 }}>13+ • Our own rules • Privacy first • Secure payments • UG Community.</p>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>🔒 Privacy First</span>
        <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.2)' }}>👨‍👩‍👧‍👦 13+ Allowed</span>
        <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}>💳 Secure Payments</span>
      </div>
      <button className="info-detail-btn" onClick={() => open("terms")} style={{ marginTop: 10 }}>Read Terms & Privacy →</button>
    </section>
  )
}

export default function Sheet() {
  const [p, setP] = useState({ monthlyFormatted: "AED 10", yearlyFormatted: "AED 100", saveFormatted: "AED 20", currency: "AED" } as any)
  const [payg, setPayg] = useState({ formatted: "AED 4", movies: 5 } as any)
  useEffect(()=>{ try{ setP(getPricing()); setPayg(getPaygPricing()) }catch{} }, [])

  return (
    <div className="footer-sheet-body" style={{ padding: '16px 16px 36px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Hero - OUR DNA - Black + Yellow */}
      <div style={{
        background: 'linear-gradient(135deg, #111 0%, #1a1a1a 40%, #222 100%)',
        borderRadius: 16,
        padding: '18px 16px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255,193,7,0.15)'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'radial-gradient(circle, rgba(255,193,7,0.18) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', position: 'relative' }}>
          <img src="/logo.png" alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} onError={(e:any)=>e.target.style.display='none'} />
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'white' }}>UG CONNECT • Terms & Privacy</h2>
            <p style={{ margin: 0, fontSize: 10, opacity: 0.6, color: 'white' }}>Our platform • Our rules • Built for UG • Last updated: May 12, 2025</p>
          </div>
        </div>
        <p style={{ fontSize: 11.5, lineHeight: 1.6, marginTop: 10, opacity: 0.9, color: 'white' }}>
          Welcome home. These are our terms — written by us, for our people. No copy-paste, no big-company talk. Straight Luganda-English, clear like we talk at home. If you're 13 or older, you're welcome in.
        </p>
      </div>

      {/* Age */}
      <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderLeft: '3px solid #22c55e', borderRadius: 12, padding: 12 }}>
        <strong style={{ fontSize: 12 }}>👨‍👩‍👧‍👦 1. Age — 13 Years & Above</strong>
        <p style={{ fontSize: 11.5, lineHeight: 1.6, marginTop: 6, opacity: 0.9 }}>
          UG Connect is built for Ugandans 13 years and above. If you're 13-17, your parent or guardian agrees with you. Under 13? Come with your elder. We make family-safe content — VJ translations have action and drama, but we keep it clean. No porn, no tribal hate, no abuse. We protect our culture.
        </p>
      </div>

      {/* Accounts */}
      <div>
        <strong style={{ fontSize: 12 }}>2. Accounts — What You Can Do</strong>
        <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
          <div style={{ fontSize: 11, background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '8px 10px' }}>
            <strong>Guest (Free):</strong> Watch previews, trailers, reels. No sign-in. Data stays only on this device.
          </div>
          <div style={{ fontSize: 11, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '8px 10px' }}>
            <strong>PAYG:</strong> {payg.formatted} = {payg.movies} full movies. Pay once, watch instantly. No monthly bill. Like buying data bundle.
          </div>
          <div style={{ fontSize: 11, background: 'rgba(255,193,7,0.06)', border: '1px solid rgba(255,193,7,0.2)', borderRadius: 8, padding: '8px 10px' }}>
            <strong>PRO:</strong> {p.monthlyFormatted}/Mo — Unlimited movies & series, no ads, unlimited VJ voices, 4K quality, early fresh releases.
          </div>
          <div style={{ fontSize: 11, background: '#FFC107', color: '#000', borderRadius: 8, padding: '8px 10px', fontWeight: 600 }}>
            <strong>PRO PLUS:</strong> {p.yearlyFormatted}/Yr — Save {p.saveFormatted} — All PRO + full year for price of 10 months, offline downloads, family sharing, price locked. Our best value.
          </div>
        </div>
        <p style={{ fontSize: 10.5, opacity: 0.6, marginTop: 6 }}>One person one account. Guest data moves when you sign in. Don't share password — we may limit devices if abused. You can leave anytime.</p>
      </div>

      {/* Privacy */}
      <div style={{ background: 'linear-gradient(135deg, rgba(255,193,7,0.06) 0%, hsl(var(--surface)) 100%)', border: '1px solid rgba(255,193,7,0.18)', borderRadius: 12, padding: 12 }}>
        <strong style={{ fontSize: 12 }}>🔒 3. Privacy — We Protect You Like Our Own</strong>
        <p style={{ fontSize: 11.5, lineHeight: 1.6, marginTop: 6 }}>
          <strong>What we keep (small):</strong> Email, name if you give us, watch history, My List, device type. That's it.<br/>
          <strong>Payments:</strong> We NEVER keep your card. Our payment partners handle it with strong encryption. We only see success or fail.<br/>
          <strong>What we never do:</strong> We never sell your data. We never read your phone contacts. We never follow you outside UG Connect.<br/>
          <strong>Why we keep:</strong> To sync your history across devices, suggest movies from VJs you love, keep you logged in.<br/>
          <strong>Your power:</strong> Delete account anytime — email us, we wipe in 7 days. You can ask for your data copy.<br/>
          <strong>Kids:</strong> No data from under-13 without elder permission. If we find it, we delete fast.
        </p>
      </div>

      {/* Payments */}
      <div>
        <strong style={{ fontSize: 12 }}>💳 4. Payments — Secure & Clear</strong>
        <p style={{ fontSize: 11.5, lineHeight: 1.6, marginTop: 6, opacity: 0.9 }}>
          Base price in AED — your screen shows in {p.currency} auto by location. PRO {p.monthlyFormatted}/mo, PRO PLUS {p.yearlyFormatted}/yr save {p.saveFormatted}, PAYG {payg.formatted} = {payg.movies} movies.<br/>
          • All payments through secure stores and encrypted gateways — bank-level protection.<br/>
          • No hidden charges. Renewal auto unless you stop it. Stop anytime in 1 tap — no hard feelings, we keep your seat.<br/>
          • Refund: 7 days if you didn't watch. PAYG not refundable once movie starts playing.<br/>
          • Share bonus: Bring 5 friends who sign in = 10 movies free. Our thank you for growing the family.
        </p>
      </div>

      {/* Contact */}
      <div style={{ background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 12 }}>
        <strong style={{ fontSize: 12 }}>📞 5. Contact — We Answer Fast</strong>
        <p style={{ fontSize: 11.5, lineHeight: 1.6, marginTop: 6, opacity: 0.9 }}>
          Luganda & English, usually 2 hours. Support: support@ugconnect.ug • Privacy: privacy@ugconnect.ug • WhatsApp: +256 700 123456 • Office: DOPE TONE, Kampala, UG. We listen — complain, suggest, ask.
        </p>
      </div>

      {/* Content */}
      <div>
        <strong style={{ fontSize: 12 }}>🎬 6. Movies & VJ Voices — Ours & Licensed</strong>
        <p style={{ fontSize: 11.5, lineHeight: 1.6, marginTop: 6, opacity: 0.9 }}>
          All movies licensed from our partners. VJs translated and voiced with our permission — we pay them, we credit them. VJ Junior, VJ Jingo, VJ Ice P and all our legends are artists. No screen recording to sell. No re-upload. You can download for offline with PRO PLUS soon, but don't share files. Respect the craft.
        </p>
      </div>

      {/* Community */}
      <div>
        <strong style={{ fontSize: 12 }}>🤝 7. Community — Keep It Clean</strong>
        <p style={{ fontSize: 11.5, lineHeight: 1.6, marginTop: 6, opacity: 0.9 }}>
          Be decent. No tribal hate, no bullying, no spam in comments, no porn, no violence talk. We manage like elders at home — first warning, then mute, then remove if you keep breaking. This is 13+ family place — younger siblings may be watching near you.
        </p>
      </div>

      {/* Law */}
      <div style={{ background: 'hsl(var(--surface))', border: '1px dashed hsl(var(--border))', borderRadius: 12, padding: 12 }}>
        <strong style={{ fontSize: 11.5 }}>8. Leaving & Rules</strong>
        <p style={{ fontSize: 10.5, lineHeight: 1.6, marginTop: 4, opacity: 0.7 }}>
          Leave anytime — cancel, delete, or just stay guest. We can suspend if you break rules like piracy or hate. Ugandan law guides us, but we respect where you live too — UAE, US, UK etc. If one rule fails, others stay. This is the full agreement between you and UG Connect. Any issue, talk to us first.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.5, marginTop: 4 }}>
        <img src="/logo.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} onError={(e:any)=>e.target.style.display='none'} />
        <p style={{ fontSize: 9.5, textAlign: 'center', lineHeight: 1.4 }}>
          UG Connect • DOPE TONE • Our Rules • Our Culture • Built for UG Worldwide<br/>{p.monthlyFormatted} • {p.yearlyFormatted} • {payg.formatted} = {payg.movies} movies • {p.currency} • 13+ • Privacy First • © 2025
        </p>
      </div>
    </div>
  )
}

