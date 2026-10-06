"use client";
import { useState } from "react";
import "./invite-friend.css";

export default function InviteSheet() {
  const [copied, setCopied] = useState(false);
  const link = "https://ugconnect.app/invite/DOPE";
  const text = `Yo! Watch Ugandan movies translated by VJs - Luganda commentary, no buffering. Join me on Ug-Connect PRO - AED 10/mo or AED 100/year save 20. Or invite 5 friends & unlock 10 movies FREE! ${link}`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(()=>setCopied(false), 2000); } catch {}
  };
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  const shareTelegram = () => window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, "_blank");
  const shareX = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  const shareNative = async () => {
    if((navigator as any).share){ try { await (navigator as any).share({ title: "Ug-Connect", text, url: link }); } catch {} } else { copy(); }
  };

  return (
    <>
      <style jsx global>{`
        .invite-root{
          width:100% !important;
          max-width:100% !important;
          min-height:100dvh !important;
          height:auto !important;
          display:flex !important;
          flex-direction:column !important;
          gap:4px !important;
          padding:8px 4px 140px 4px !important;
          margin:0 !important;
          overflow-y:auto !important;
          overflow-x:hidden !important;
          -webkit-overflow-scrolling:touch;
          overscroll-behavior:contain;
          background:hsl(var(--bg)) !important;
          color:hsl(var(--text)) !important;
        }
        .invite-card{
          width:calc(100% - 8px) !important;
          margin:2px auto !important;
          flex-shrink:0 !important;
        }
        [data-side-sheet], .sheet-shell, .side-sheet-content {
          overflow-y:auto !important;
          height:100% !important;
          max-height:100dvh !important;
        }
      `}</style>

      <div style={{ height: "100dvh", overflowY: "auto", overflowX: "hidden" }}>
        <div className="invite-root">
          <div className="invite-hero">
            <div className="invite-icon">🎁</div>
            <h2>Invite Friends, Watch Free</h2>
            <p>Share Ug-Connect with <b>5 friends who sign in</b>, and you unlock <b>10 movies absolutely free</b>.</p>
          </div>

          <div className="invite-card pro">
            <div className="invite-badge">PRO REFERRAL • FREE MOVIES</div>
            <div className="invite-progress-big">
              <div className="prog-head"><span>Your Progress</span><span>0 / 5</span></div>
              <div className="bar"><div className="fill" style={{width:"0%"}}></div></div>
              <small>0 friends invited • 0 / 10 movies unlocked</small>
            </div>

            <div className="invite-link-box">
              <span>{link}</span>
              <button onClick={copy}>{copied ? "Copied!" : "Copy"}</button>
            </div>

            <div className="share-grid">
              <button onClick={shareWhatsApp} className="share-btn wa">WhatsApp</button>
              <button onClick={shareTelegram} className="share-btn tg">Telegram</button>
              <button onClick={shareX} className="share-btn x">X</button>
              <button onClick={copy} className="share-btn copy">Copy Link</button>
            </div>

            <button onClick={shareNative} className="invite-cta">Share Now • Unlock 10 Free</button>
            <p className="invite-note">Pricing auto shows in your local currency (AED). PRO is AED 10/mo or AED 100/year - save AED 20.</p>
          </div>

          <div className="invite-card how">
            <h3>How it works</h3>
            <div className="step"><b>1</b><span>Share your link with friends</span></div>
            <div className="step"><b>2</b><span>Friend signs in on Ug-Connect</span></div>
            <div className="step"><b>3</b><span>After 5 friends, 10 movies unlocked free instantly</span></div>
          </div>

          {/* EXTRA CONTENT TO FORCE OVERFLOW TEST - DELETE LATER */}
          <div className="invite-card how"><h3>Extra Rewards</h3><p style={{fontSize:"12px",opacity:.7}}>Invite 10 friends = 1 month PRO free. Invite 20 = 3 months PRO free. Keeps scrolling - no cut off.</p></div>
        </div>
      </div>
    </>
  );
}

Bor fix this sheet its content must scroll when overflow

/* FOLLOWING YOUR THEME DNA - INVITE / SHARE SHEET - FULL LENGTH SCROLLABLE */
.invite-root{
  width: 100% !important;
  max-width: 100% !important;
  min-height: 100dvh !important;
  height: auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important; /* inner cards almost touching mother */
  padding: 8px 4px 120px 4px !important;
  margin: 0 !important;
  background: hsl(var(--bg)) !important;
  color: hsl(var(--text)) !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* HERO */
.invite-hero{text-align:center;padding:8px 4px}
.invite-icon{font-size:36px;margin-bottom:6px}
.invite-hero h2{font-size:20px;font-weight:800;margin:0;color:hsl(var(--text))}
.invite-hero p{font-size:13px;color:hsl(var(--text-muted));line-height:1.4;margin:6px 0}

/* INNER CARDS - ALMOST TOUCHING MOTHER - FULL WIDTH */
.invite-card{
  width: calc(100% - 8px) !important; /* 4px gap each side = touching mother */
  max-width: none !important;
  margin: 2px auto !important;
  background: hsl(var(--surface)) !important;
  border: 1.5px solid hsl(var(--border)) !important;
  border-radius: 16px !important;
  padding: 14px !important;
  flex-shrink: 0 !important;
  color: hsl(var(--text)) !important;
  transition: background .2s;
}
.invite-card:hover{ background: hsl(var(--surface-hover)) !important; }
.invite-card.pro{ border-width: 2px !important; }

.invite-badge{
  background: hsl(var(--primary)) !important;
  color: hsl(var(--primary-text)) !important;
  font-size: 10px;font-weight: 800;padding: 4px 10px;border-radius: 999px;
  display: inline-block;margin-bottom: 12px;letter-spacing: .5px;
}

/* PROGRESS */
.invite-progress-big{margin:8px 0 12px 0}
.prog-head{display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:hsl(var(--text))}
.bar{height:8px;background:hsl(var(--bg));border:1px solid hsl(var(--border));border-radius:999px;overflow:hidden;margin:8px 0}
.fill{height:100%;background:hsl(var(--primary));width:0%;transition:width .3s}
.invite-progress-big small{font-size:11px;color:hsl(var(--text-muted))}

/* LINK BOX */
.invite-link-box{
  display:flex;gap:8px;
  background: hsl(var(--bg));
  border:1.5px solid hsl(var(--border));
  border-radius:12px;padding:10px 12px;margin:12px 0;align-items:center
}
.invite-link-box span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;color:hsl(var(--text-muted))}
.invite-link-box button{
  background:hsl(var(--primary));color:hsl(var(--primary-text));
  border:0;border-radius:8px;padding:6px 12px;font-weight:800;cursor:pointer
}

/* SHARE BUTTONS */
.share-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:12px 0}
.share-btn{
  border:1.5px solid hsl(var(--border));
  border-radius:12px;padding:12px;font-weight:700;
  background:hsl(var(--surface));color:hsl(var(--text));cursor:pointer
}
.share-btn:hover{ background:hsl(var(--surface-hover)); }
.share-btn.wa,.share-btn.tg,.share-btn.x{
  background:hsl(var(--bg)); /* keep inside theme DNA */
  border:1.5px solid hsl(var(--border));
  color:hsl(var(--text));
}
.share-btn.copy{ background:hsl(var(--primary)); color:hsl(var(--primary-text)); border-color:hsl(var(--primary)); }

.invite-cta{
  width:100%;background:hsl(var(--primary)) !important;color:hsl(var(--primary-text)) !important;
  border:1.5px solid hsl(var(--border));border-radius:999px;padding:14px;
  font-weight:800;font-size:15px;margin-top:8px;cursor:pointer
}
.invite-note{font-size:11px;color:hsl(var(--text-muted));margin-top:8px;text-align:center;line-height:1.3}

/* HOW IT WORKS */
.invite-card.how{ border-style: dashed !important; }
.invite-card.how h3{margin:0 0 10px 0;font-size:14px;color:hsl(var(--text))}
.step{display:flex;gap:10px;align-items:center;margin:8px 0;font-size:13px;color:hsl(var(--text))}
.step b{
  width:24px;height:24px;border-radius:999px;
  background:hsl(var(--primary));color:hsl(var(--primary-text));
  display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0
}