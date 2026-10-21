"use client"
import { useState } from "react"

export function Tile({ open, sectionRef }: any) {
  return (
    <section id="contact" ref={sectionRef} className="info-section" style={{
      background: 'linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--bg)) 100%)',
      border: '1px solid hsl(var(--border))',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'radial-gradient(circle, rgba(255,193,7,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#111', border: '1px solid rgba(255,193,7,0.2)', display: 'grid', placeItems: 'center', fontSize: 16 }}>📞</div>
        <h2 style={{ margin: 0, fontSize: 15 }}>Contact Us</h2>
      </div>
      <p style={{ fontSize: 12.5, lineHeight: 1.5 }}>For partnerships, VJ applications, support — we reply in Luganda & English, ~2hrs.</p>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: 'hsl(var(--bg))', border: '1px solid hsl(var(--border))' }}>✉️ support@ugconnect.ug</span>
        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: 'rgba(255,193,7,0.12)', border: '1px solid rgba(255,193,7,0.25)' }}>💬 +256 700</span>
      </div>
      <button className="info-detail-btn" onClick={() => open("contact")} style={{ marginTop: 10 }}>Contact details →</button>
    </section>
  )
}

export default function Sheet() {
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [msg, setMsg] = useState("")
  const [type, setType] = useState("support")
  const [sent, setSent] = useState(false)

  const send = async () => {
    if (!msg.trim()) return
    await new Promise(r=>setTimeout(r, 600))
    try {
      const prev = JSON.parse(localStorage.getItem('ug_contacts')||'[]')
      localStorage.setItem('ug_contacts', JSON.stringify([...prev, { name, email, msg, type, time: new Date().toISOString() }]))
    } catch {}
    setSent(true)
    setTimeout(()=>{ setSent(false); setShowModal(false); setMsg(""); setName(""); setEmail("") }, 2200)
  }

  const copy = (t: string) => { try { navigator.clipboard.writeText(t) } catch {} }

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
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'white' }}>Contact — We Listen</h2>
            <p style={{ margin: 0, fontSize: 10, opacity: 0.6, color: 'white' }}>Luganda & English • Reply ~2hrs • Kampala HQ</p>
          </div>
        </div>
        <p style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 10, opacity: 0.85, color: 'white' }}>
          Talk to us — support, VJ job, partnership, or just hello. We are DOPE TONE in Kampala, building for UG worldwide.
        </p>
      </div>

      {/* Contact cards */}
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#111', display: 'grid', placeItems: 'center', fontSize: 14 }}>✉️</div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.6, fontWeight: 700 }}>EMAIL</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>support@ugconnect.ug</div>
              <div style={{ fontSize: 9, opacity: 0.6 }}>privacy@ugconnect.ug • vj@ugconnect.ug</div>
            </div>
          </div>
          <button onClick={()=>copy('support@ugconnect.ug')} style={{ fontSize: 10, padding: '6px 10px', borderRadius: 99, border: '1px solid hsl(var(--border))', background: 'hsl(var(--bg))' }}>Copy</button>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, hsl(var(--surface)) 100%)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#22c55e', color: 'white', display: 'grid', placeItems: 'center', fontSize: 14 }}>💬</div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.6, fontWeight: 700 }}>WHATSAPP</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>+256 700 123456</div>
              <div style={{ fontSize: 9, opacity: 0.6 }}>Fastest • Voice notes OK</div>
            </div>
          </div>
          <button onClick={()=>{ try{ window.open('https://wa.me/256700123456','_blank') }catch{} }} style={{ fontSize: 10, padding: '6px 10px', borderRadius: 99, border: 'none', background: '#22c55e', color: 'white', fontWeight: 700 }}>Chat</button>
        </div>

        <div style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: '12px', display: 'flex', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#111', display: 'grid', placeItems: 'center', fontSize: 14 }}>📍</div>
          <div>
            <div style={{ fontSize: 10, opacity: 0.6, fontWeight: 700 }}>OFFICE</div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>DOPE TONE, Kampala, Uganda</div>
            <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2, lineHeight: 1.4 }}>Built for UG Community Worldwide — Dubai, London, Toronto, Kampala. Remote team but heart in UG.</div>
          </div>
        </div>
      </div>

      {/* VJ application */}
      <div style={{ background: 'linear-gradient(135deg, rgba(255,193,7,0.08) 0%, hsl(var(--surface)) 100%)', border: '1px solid rgba(255,193,7,0.18)', borderRadius: 12, padding: 12 }}>
        <strong style={{ fontSize: 11.5, display: 'flex', gap: 6 }}>🎙️ Want to be VJ? Partnership?</strong>
        <p style={{ fontSize: 10.5, lineHeight: 1.5, marginTop: 6, opacity: 0.8 }}>
          Send sample translation (2-min voice over clip) + your name + WhatsApp to vj@ugconnect.ug or use form below. For partnership — brands, telcos, movie licensors — email partnerships@ugconnect.ug. Response 24-48h.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={()=>setShowModal(true)}
        style={{
          width: '100%',
          background: '#111',
          color: 'white',
          border: '1px solid rgba(255,193,7,0.2)',
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
        <span>✉️</span> Send us a message
      </button>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', zIndex: 10000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={()=>setShowModal(false)}>
          <div style={{ background: 'hsl(var(--bg))', borderTop: '1px solid hsl(var(--border))', borderLeft: '1px solid hsl(var(--border))', borderRight: '1px solid hsl(var(--border))', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto', padding: '16px 16px 28px' }} onClick={e=>e.stopPropagation()}>
            <div style={{ width: 36, height: 4, background: 'hsl(var(--border))', borderRadius: 99, margin: '0 auto 14px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>Send message</h3>
              <button onClick={()=>setShowModal(false)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', display: 'grid', placeItems: 'center' }}>✕</button>
            </div>

            {!sent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { id: 'support', label: '🛠️ Support' },
                    { id: 'vj', label: '🎙️ VJ Job' },
                    { id: 'partner', label: '🤝 Partner' }
                  ].map(c=>(
                    <button key={c.id} onClick={()=>setType(c.id)} style={{ fontSize: 10, padding: '6px 10px', borderRadius: 99, border: type===c.id ? '1.5px solid #FFC107' : '1px solid hsl(var(--border))', background: type===c.id ? '#FFC107' : 'hsl(var(--surface))', color: type===c.id ? '#000' : 'hsl(var(--text))', fontWeight: type===c.id ? 700 : 500 }}>{c.label}</button>
                  ))}
                </div>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={{ width: '100%', background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: '10px 12px', fontSize: 12 }} />
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email (optional)" style={{ width: '100%', background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: '10px 12px', fontSize: 12 }} />
                <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Type your message..." rows={4} style={{ width: '100%', background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: '10px 12px', fontSize: 12, resize: 'none' }} />
                <button onClick={send} disabled={!msg.trim()} style={{ width: '100%', background: !msg.trim() ? 'hsl(var(--surface))' : '#111', color: !msg.trim() ? 'hsl(var(--text))' : 'white', border: '1px solid #111', borderRadius: 12, padding: '12px', fontSize: 12, fontWeight: 700, cursor: !msg.trim() ? 'not-allowed' : 'pointer' }}>Send →</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#22c55e', color: 'white', display: 'grid', placeItems: 'center', fontSize: 20, margin: '0 auto 10px' }}>✓</div>
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>Message sent!</h4>
                <p style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>We got it — reply in ~2hrs Luganda/English.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <p style={{ fontSize: 9, opacity: 0.4, textAlign: 'center' }}>DOPE TONE • Kampala • support@ugconnect.ug • +256 700 123456 • © 2025</p>
    </div>
  )
}

