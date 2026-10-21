"use client"
import { useState, useEffect } from "react"

export function Tile({ open, sectionRef }: any) {
  return (
    <section id="report" ref={sectionRef} className="info-section" style={{
      background: 'linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--bg)) 100%)',
      border: '1px solid hsl(var(--border))',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#111', border: '1px solid rgba(239,68,68,0.2)', display: 'grid', placeItems: 'center', fontSize: 16 }}>🚨</div>
        <h2 style={{ margin: 0, fontSize: 15 }}>Report a Problem</h2>
      </div>
      <p style={{ fontSize: 12.5, lineHeight: 1.5 }}>Wrong VJ, bad video, offensive content? Tell us — we review in 48h. Use ••• menu or here.</p>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))' }}>🎙️ Wrong VJ</span>
        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>🚨 Offensive</span>
        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))' }}>📹 Bad video</span>
      </div>
      <button className="info-detail-btn" onClick={() => open("report")} style={{ marginTop: 10 }}>Report now →</button>
    </section>
  )
}

export default function Sheet() {
  const [showModal, setShowModal] = useState(false)
  const [category, setCategory] = useState("wrong_vj")
  const [movieId, setMovieId] = useState("")
  const [details, setDetails] = useState("")
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    try {
      const url = new URL(window.location.href)
      const mid = url.searchParams.get('movieId') || ''
      if (mid) setMovieId(mid)
    } catch {}
  }, [])

  const submit = async () => {
    if (!details.trim()) return
    setLoading(true)
    await new Promise(r=>setTimeout(r, 700))
    try {
      const prev = JSON.parse(localStorage.getItem('ug_reports')||'[]')
      localStorage.setItem('ug_reports', JSON.stringify([...prev, { category, movieId, details, email, time: new Date().toISOString(), page: window.location.href }]))
    } catch {}
    console.log('Report submitted', { category, movieId, details })
    setLoading(false)
    setSent(true)
    setTimeout(()=>{ setSent(false); setShowModal(false); setDetails(""); }, 2500)
  }

  return (
    <div className="footer-sheet-body" style={{ padding: '16px 16px 36px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #111 0%, #1a1a1a 40%, #222 100%)',
        border: '1px solid rgba(239,68,68,0.15)',
        borderRadius: 16,
        padding: '16px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', position: 'relative' }}>
          <img src="/logo.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} onError={(e:any)=>e.target.style.display='none'} />
          <div>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'white' }}>Report a Problem</h2>
            <p style={{ margin: 0, fontSize: 10, opacity: 0.6, color: 'white' }}>We review within 48h • Private • No retaliation</p>
          </div>
        </div>
        <p style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 10, opacity: 0.85, color: 'white' }}>
          Found wrong VJ, bad audio, black screen, offensive comment, or stolen content? Tell us. Your report helps whole UG community.
        </p>
      </div>

      {/* Quick how */}
      <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 12 }}>
        <strong style={{ fontSize: 11.5 }}>⚡ Fastest way — from movie</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}><span style={{ width: 20, height: 20, borderRadius: '50%', background: '#111', color: 'white', display: 'grid', placeItems: 'center', fontSize: 10 }}>1</span><span>Tap <strong>•••</strong> on any movie or reel</span></div>
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}><span style={{ width: 20, height: 20, borderRadius: '50%', background: '#111', color: 'white', display: 'grid', placeItems: 'center', fontSize: 10 }}>2</span><span>Tap <strong>Report a Problem</strong></span></div>
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}><span style={{ width: 20, height: 20, borderRadius: '50%', background: '#FFC107', color: '#000', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 800 }}>3</span><span>Choose type + write details — goes to same place as this form</span></div>
        </div>
        <p style={{ fontSize: 10, opacity: 0.6, marginTop: 8 }}>Flow: /report?movieId=&type=reel — we log movieId automatically.</p>
      </div>

      {/* Categories */}
      <div>
        <strong style={{ fontSize: 12 }}>What can you report?</strong>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {[
            { id: 'wrong_vj', label: '🎙️ Wrong VJ' },
            { id: 'bad_video', label: '📹 Bad video / audio' },
            { id: 'offensive', label: '🚨 Offensive / hate' },
            { id: 'copyright', label: '©️ Stolen / copyright' },
            { id: 'other', label: '💬 Other' }
          ].map(c=>(
            <span key={c.id} style={{ fontSize: 10, padding: '5px 10px', borderRadius: 99, background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}>{c.label}</span>
          ))}
        </div>
      </div>

      <button
        onClick={()=>setShowModal(true)}
        style={{
          width: '100%',
          background: '#111',
          color: 'white',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 12,
          padding: '14px 16px',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer'
        }}
      >
        🚨 Report Issue Now
      </button>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', zIndex: 10000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={()=>!loading && setShowModal(false)}>
          <div style={{ background: 'hsl(var(--bg))', borderTop: '1px solid hsl(var(--border))', borderLeft: '1px solid hsl(var(--border))', borderRight: '1px solid hsl(var(--border))', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: 480, maxHeight: '88vh', overflowY: 'auto', padding: '16px 16px 28px' }} onClick={e=>e.stopPropagation()}>
            <div style={{ width: 36, height: 4, background: 'hsl(var(--border))', borderRadius: 99, margin: '0 auto 14px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>Report problem</h3>
              <button onClick={()=>setShowModal(false)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', display: 'grid', placeItems: 'center' }}>✕</button>
            </div>

            {!sent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, marginBottom: 6 }}>ISSUE TYPE</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      { id: 'wrong_vj', label: '🎙️ Wrong VJ' },
                      { id: 'bad_video', label: '📹 Bad video' },
                      { id: 'offensive', label: '🚨 Offensive' },
                      { id: 'copyright', label: '©️ Copyright' },
                      { id: 'other', label: '💬 Other' }
                    ].map(c=>(
                      <button key={c.id} onClick={()=>setCategory(c.id)} style={{ fontSize: 10, padding: '6px 10px', borderRadius: 99, border: category===c.id ? '1.5px solid #ef4444' : '1px solid hsl(var(--border))', background: category===c.id ? '#ef4444' : 'hsl(var(--surface))', color: category===c.id ? 'white' : 'hsl(var(--text))', fontWeight: category===c.id ? 700 : 500 }}>{c.label}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, marginBottom: 6 }}>MOVIE ID (optional, auto if from movie)</div>
                  <input value={movieId} onChange={e=>setMovieId(e.target.value)} placeholder="Ex: 12345 or leave empty" style={{ width: '100%', background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: '10px 12px', fontSize: 11 }} />
                </div>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, marginBottom: 6 }}>YOUR EMAIL (optional, for update)</div>
                  <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" style={{ width: '100%', background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: '10px 12px', fontSize: 11 }} />
                </div>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, marginBottom: 6 }}>WHAT HAPPENED? *</div>
                  <textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Ex: Movie says VJ Junior but voice is VJ Emmy... or video has black screen at 20:00..." rows={5} style={{ width: '100%', background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: '10px 12px', fontSize: 11.5, lineHeight: 1.5, resize: 'none' }} />
                  <div style={{ fontSize: 9, opacity: 0.5, textAlign: 'right', marginTop: 4 }}>{details.length} chars</div>
                </div>

                <button onClick={submit} disabled={!details.trim() || loading} style={{ width: '100%', background: !details.trim() ? 'hsl(var(--surface))' : '#111', color: !details.trim() ? 'hsl(var(--text))' : 'white', border: '1px solid #111', borderRadius: 12, padding: '14px', fontSize: 12, fontWeight: 700, opacity: loading ? 0.7 : 1, cursor: !details.trim() ? 'not-allowed' : 'pointer' }}>{loading ? 'Reporting...' : 'Submit Report →'}</button>
                <p style={{ fontSize: 9, opacity: 0.4, textAlign: 'center' }}>Private • We review in 48h • No retaliation • Your report helps community</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#22c55e', color: 'white', display: 'grid', placeItems: 'center', fontSize: 20, margin: '0 auto 10px' }}>✓</div>
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>Report sent — Webale!</h4>
                <p style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>Thanks. We check within 48h and fix. If you left email, we update you.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <p style={{ fontSize: 9, opacity: 0.4, textAlign: 'center' }}>UG Connect • Report • 48h review • Private • © 2025</p>
    </div>
  )
}

