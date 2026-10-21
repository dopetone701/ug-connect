"use client"
import { useState } from "react"

export function Tile({ open, sectionRef }: any) {
  return (
    <section id="help" ref={sectionRef} className="info-section" style={{
      background: 'linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--bg)) 100%)',
      border: '1px solid hsl(var(--border))',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'radial-gradient(circle, rgba(255,193,7,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#111', border: '1px solid rgba(255,193,7,0.2)', display: 'grid', placeItems: 'center', fontSize: 16 }}>🛠️</div>
        <h2 style={{ margin: 0, fontSize: 15 }}>Help Center</h2>
      </div>
      <p style={{ fontSize: 12.5, lineHeight: 1.5 }}>Stuck? Buffering? Payment failed? Tell us — we fix fast. Type your issue and submit.</p>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))' }}>⚡ Quick fix</span>
        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: 'rgba(255,193,7,0.12)', border: '1px solid rgba(255,193,7,0.25)' }}>📝 Submit issue</span>
      </div>
      <button className="info-detail-btn" onClick={() => open("help")} style={{ marginTop: 10 }}>Get help →</button>
    </section>
  )
}

export default function Sheet() {
  const [showModal, setShowModal] = useState(false)
  const [category, setCategory] = useState("playback")
  const [email, setEmail] = useState("")
  const [issue, setIssue] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const submitIssue = async () => {
    if (!issue.trim()) return
    setLoading(true)
    // Simulate submit - in real app send to API
    await new Promise(r => setTimeout(r, 800))
    const data = { category, email, issue, time: new Date().toISOString(), page: window.location.href }
    try { 
      const prev = JSON.parse(localStorage.getItem('ug_help_issues') || '[]')
      localStorage.setItem('ug_help_issues', JSON.stringify([...prev, data]))
    } catch {}
    console.log('Help issue submitted:', data)
    setLoading(false)
    setSubmitted(true)
    setTimeout(()=>{ setSubmitted(false); setShowModal(false); setIssue(""); setEmail("") }, 2500)
  }

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
          <img src="/logo.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} onError={(e:any)=>e.target.style.display='none'} />
          <div>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'white' }}>Help Center — We Fix Fast</h2>
            <p style={{ margin: 0, fontSize: 10, opacity: 0.6, color: 'white' }}>Tap issue, type, submit • Luganda & English • ~2hr reply</p>
          </div>
        </div>
      </div>

      {/* Quick fixes */}
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 14 }}>📺</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>Playback not working?</div>
            <div style={{ fontSize: 10.5, opacity: 0.7, marginTop: 2 }}>Tap video to show controls • Switch quality 4K/1080p • Close other apps • Check bundles</div>
          </div>
        </div>
        <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 14 }}>💳</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>Payment stuck?</div>
            <div style={{ fontSize: 10.5, opacity: 0.7, marginTop: 2 }}>Wait 2 min, check SMS, try PAYG {`AED 4 = 5 movies`} first. If debited no movie, submit below.</div>
          </div>
        </div>
      </div>

      {/* Big CTA */}
      <button
        onClick={()=>setShowModal(true)}
        style={{
          width: '100%',
          background: '#FFC107',
          color: '#000',
          border: 'none',
          borderRadius: 12,
          padding: '14px 16px',
          fontSize: 13,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(255,193,7,0.25)'
        }}
      >
        <span>📝</span> Type Your Issue & Submit
      </button>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: 0
        }} onClick={()=>!loading && setShowModal(false)}>
          <div
            style={{
              background: 'hsl(var(--bg))',
              borderTop: '1px solid hsl(var(--border))',
              borderLeft: '1px solid hsl(var(--border))',
              borderRight: '1px solid hsl(var(--border))',
              borderRadius: '16px 16px 0 0',
              width: '100%',
              maxWidth: 480,
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '16px 16px 28px',
              animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)'
            }}
            onClick={(e)=>e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, background: 'hsl(var(--border))', borderRadius: 99, margin: '0 auto 14px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Tell us what's wrong</h3>
              <button onClick={()=>setShowModal(false)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', display: 'grid', placeItems: 'center' }}>✕</button>
            </div>

            {!submitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Category */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, marginBottom: 6 }}>ISSUE TYPE</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      { id: 'playback', label: '📺 Playback' },
                      { id: 'payment', label: '💳 Payment' },
                      { id: 'account', label: '👤 Account' },
                      { id: 'movie', label: '🎬 Movie missing' },
                      { id: 'other', label: '💬 Other' }
                    ].map(c=>(
                      <button
                        key={c.id}
                        onClick={()=>setCategory(c.id)}
                        style={{
                          fontSize: 11,
                          padding: '6px 12px',
                          borderRadius: 99,
                          border: category===c.id ? '1.5px solid #FFC107' : '1px solid hsl(var(--border))',
                          background: category===c.id ? '#FFC107' : 'hsl(var(--surface))',
                          color: category===c.id ? '#000' : 'hsl(var(--text))',
                          fontWeight: category===c.id ? 700 : 500
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, marginBottom: 6 }}>YOUR EMAIL (optional)</div>
                  <input
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    placeholder="you@email.com — for reply"
                    style={{
                      width: '100%',
                      background: 'hsl(var(--surface))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 10,
                      padding: '10px 12px',
                      fontSize: 12,
                      color: 'hsl(var(--text))',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Issue */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, marginBottom: 6 }}>WHAT HAPPENED? *</div>
                  <textarea
                    value={issue}
                    onChange={(e)=>setIssue(e.target.value)}
                    placeholder="Ex: I paid AED 4 for 5 movies but only got 2... or video keeps buffering on VJ Junior movie..."
                    rows={5}
                    style={{
                      width: '100%',
                      background: 'hsl(var(--surface))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 10,
                      padding: '10px 12px',
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: 'hsl(var(--text))',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                  <div style={{ fontSize: 9, opacity: 0.5, marginTop: 4, textAlign: 'right' }}>{issue.length} chars</div>
                </div>

                <button
                  onClick={submitIssue}
                  disabled={!issue.trim() || loading}
                  style={{
                    width: '100%',
                    background: !issue.trim() ? 'hsl(var(--surface))' : '#111',
                    color: !issue.trim() ? 'hsl(var(--text))' : 'white',
                    border: !issue.trim() ? '1px solid hsl(var(--border))' : '1px solid #111',
                    borderRadius: 12,
                    padding: '14px',
                    fontSize: 13,
                    fontWeight: 700,
                    opacity: loading ? 0.7 : 1,
                    cursor: !issue.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Sending...' : 'Submit Issue →'}
                </button>
                <p style={{ fontSize: 9, opacity: 0.4, textAlign: 'center' }}>We reply in Luganda & English in ~2hrs • Your data stays private</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#22c55e', color: 'white', display: 'grid', placeItems: 'center', fontSize: 20, margin: '0 auto 12px' }}>✓</div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Sent! We got it.</h4>
                <p style={{ fontSize: 11.5, opacity: 0.7, marginTop: 6, lineHeight: 1.5 }}>Thanks for telling us. We check every issue. Expect reply on email if you left it, or WhatsApp support.</p>
              </div>
            )}
          </div>
          <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        </div>
      )}

      <div style={{ background: 'hsl(var(--surface))', border: '1px dashed hsl(var(--border))', borderRadius: 10, padding: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6 }}>Other ways:</div>
        <div style={{ fontSize: 11, marginTop: 4, lineHeight: 1.6, opacity: 0.8 }}>
          • Email: support@ugconnect.ug<br/>• WhatsApp: +256 700 123456<br/>• Office: DOPE TONE, Kampala
        </div>
      </div>

      <p style={{ fontSize: 9, opacity: 0.4, textAlign: 'center' }}>No AI • No copy • Our team reads every issue • © UG Connect 2025</p>
    </div>
  )
}

