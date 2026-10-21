"use client"

export function Tile({ open, sectionRef }: any) {
  return (
    <section id="about" ref={sectionRef} className="info-section" style={{
      background: 'linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--bg)) 100%)',
      border: '1px solid hsl(var(--border))',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: 140,
        height: 140,
        background: 'radial-gradient(circle, rgba(255,193,7,0.15) 0%, rgba(255,87,34,0.08) 40%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: 'hsl(var(--bg))',
          border: '1px solid hsl(var(--border))',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 4px 20px rgba(255,193,7,0.25), 0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <img
            src="/logo.png"
            alt="UG Connect Logo"
            style={{ width: 48, height: 48, objectFit: 'contain' }}
            onError={(e: any) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'grid' }}
          />
          <div style={{ display: 'none', width: 48, height: 48, placeItems: 'center', fontWeight: 800, fontSize: 16 }}>UG</div>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 16 }}>About UG Connect</h2>
          <p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>Built for Ugandans, Home & Abroad</p>
        </div>
      </div>
      <p style={{ lineHeight: 1.6, fontSize: 13 }}>Home is not a place, it's a feeling. UG Connect brings that feeling back through the VJ voices you grew up with.</p>
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, padding: '5px 10px', borderRadius: 99, background: 'rgba(255,193,7,0.12)', border: '1px solid rgba(255,193,7,0.25)', fontWeight: 500 }}>🇺🇬 For Ugandans Worldwide</span>
        <span style={{ fontSize: 11, padding: '5px 10px', borderRadius: 99, background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}>🎙️ VJ Culture</span>
      </div>
      <button className="info-detail-btn" onClick={() => open("about")} style={{ marginTop: 12 }}>Our story →</button>
    </section>
  )
}

export default function Sheet() {
  return (
    <div className="footer-sheet-body" style={{ padding: '16px 16px 32px', position: 'relative' }}>
      {/* Watermark logo reflecting page */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 10,
        opacity: 0.04,
        pointerEvents: 'none',
        transform: 'rotate(-8deg)'
      }}>
        <img src="/logo.png" alt="" style={{ width: 120, height: 120, objectFit: 'contain' }} />
      </div>

      {/* Hero with logo color tint */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,193,7,0.12) 0%, hsl(var(--surface)) 50%, hsl(var(--bg)) 100%)',
        border: '1px solid rgba(255,193,7,0.18)',
        borderRadius: 16,
        padding: '20px 16px',
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(255,193,7,0.08)'
      }}>
        <div style={{
          position: 'absolute', top: -20, right: -20, width: 100, height: 100,
          background: 'radial-gradient(circle, rgba(255,193,7,0.2) 0%, rgba(255,87,34,0.1) 40%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative' }}>
          <img src="/logo.png" alt="" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0, marginTop: 2, filter: 'drop-shadow(0 2px 8px rgba(255,193,7,0.3))' }} onError={(e: any) => e.target.style.display = 'none'} />
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2, marginBottom: 8, letterSpacing: '-0.3px' }}>
              You left home,<br/>but home never left you.
            </h2>
            <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>
              UG Connect was built for every Ugandan who knows the sound of a VJ saying <em>"...Twolekedde Ekyatulese"</em> and instantly feels at home.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>

        <div style={{
          background: 'hsl(var(--surface))',
          border: '1px solid hsl(var(--border))',
          borderLeft: '3px solid #FFC107',
          borderRadius: 12,
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>🏠</span>
            <strong style={{ fontSize: 13 }}>We Get It. Life Abroad Is Heavy.</strong>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.9 }}>
            Long shifts. Bills. Cold winters. Missing matooke, missing that loud laugh of your cousin, missing being understood without explaining yourself.
            We built UG Connect as your daily escape — 15 minutes of Luganda-translated movie that makes you laugh until your chest hurts, just like back in Katwe, Mbarara, or wherever you called home.
          </p>
        </div>

        <div style={{
          background: 'hsl(var(--surface))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 12,
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>🎙️</span>
            <strong style={{ fontSize: 13 }}>Why VJ Movies? Because They Are Us.</strong>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.9 }}>
            VJs don't just translate — they add our proverbs, our jokes, our gossip, our real life. They turn a Hollywood action film into a story about your uncle, your village, your struggle. That twist is what makes you feel seen.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.9, marginTop: 8 }}>
            That is comfort. That is mentorship — they remind you that even heroes struggle, but they keep going. That is what we need when life feels far from home. A familiar voice that says, "bajjajja bange, tofaayo, tulina solution."
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>🤝</span>
            <strong style={{ fontSize: 13 }}>A Bridge Home & Abroad.</strong>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.9 }}>
            For you in Kampala — affordable, low-data streaming that respects your bundles. For you in London, Toronto, Dubai, Boston — a place to gather. Send a movie to your cousin back home, watch the same one, laugh on WhatsApp after. Same lifestyle, same struggles, same joy. Movies become the reason to call home and release stress together.
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(255,193,7,0.1) 0%, hsl(var(--surface)) 100%)',
          border: '1px dashed rgba(255,193,7,0.3)',
          borderRadius: 12,
          padding: 14,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start'
        }}>
          <img src="/logo.png" alt="" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 2px 6px rgba(255,193,7,0.2))' }} onError={(e: any) => e.target.style.display = 'none'} />
          <div>
            <strong style={{ fontSize: 12.5 }}>From DOPE TONE, With Love</strong>
            <p style={{ fontSize: 12.5, lineHeight: 1.6, marginTop: 4, opacity: 0.85 }}>
              We are not Netflix. We are your neighbor who knows you love VJ Junior, VJ Ice P, and that one movie you watched 10 times. We preserve VJ culture, we pay VJs, we build this for Ugandans first.
              No stress. Just press play and feel at home again.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 12, textAlign: 'center' }}>
            <img src="/icon.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain', margin: '0 auto 6px', display: 'block' }} onError={(e: any) => e.target.style.display = 'none'} />
            <div style={{ fontSize: 12, fontWeight: 600 }}>Low Data</div>
            <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>UG Bundles</div>
          </div>
          <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>🌍</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Diaspora First</div>
            <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>Global Pricing</div>
          </div>
        </div>

        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.5 }}>
          <img src="/logo.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} onError={(e: any) => e.target.style.display = 'none'} />
          <p style={{ fontSize: 10, textAlign: 'center', lineHeight: 1.4 }}>
            Built in Kampala. Loved Worldwide.<br/>UG Connect • DOPE TONE © 2025
          </p>
        </div>

      </div>

      <style>{`
        .footer-sheet-body strong { color: hsl(var(--text)); }
      `}</style>
    </div>
  )
}

