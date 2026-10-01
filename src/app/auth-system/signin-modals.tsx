"use client";
import "./page.css";
import "../components/ui/service-card/service-card.css";
import { useEffect, useState } from "react";
import TheHallShell from "@/components/layout/curvy-pro-room/the-hall-shell";
import GetStartedInputGate from "@[STRIPPED 74 bytes]"
import FooterFree from "@[STRIPPED 65 bytes]"
import SigninModals from "./auth-system/signin-modals";
import LogoutModal from "./auth-system/logout-modal";

const WORKER_URL = "https://user-account-server-api.connectu89.workers.dev";

const top = [
  {id:"movies", l:"Movies", custom:true, icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/></svg>)},
  {id:"ug-foods", l:"UG Foods", customFood:true, icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16"/><path d="M5 12c0 4 3.1 7 7 7s7-3 7-7"/><path d="M8 3c-1 1.2-1 2.8 0 4"/><path d="M12 2c-1 1.5-1 3.5 0 5"/><path d="M16 3c-1 1.2-1 2.8 0 4"/></svg>)},
  {id:"mobile-money", l:"Mobile Money", customMoney:true, icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2.5"/><path d="M9 6h6"/><path d="M8 15h8"/><circle cx="12" cy="18" r="0.8" fill="currentColor" stroke="none"/><path d="M12 9v4"/><path d="M10.5 10.5 12 9l1.5 1.5"/></svg>)},
];

const bottom = [
  { id:"hair-cuts", l:"Hair Cuts", customSalon:true, icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M8.5 8.5 19 3"/><path d="M8.5 15.5 19 21"/><path d="M12 12h7"/></svg>) },
  { id:"jobs", l:"Jobs", customJobs:true, icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/><path d="M10 12v2h4v-2"/></svg>) },
  { id:"send-to-uganda", l:"Send to Uganda", customCago:true, icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7 12 3l8 4v10l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4"/><path d="M12 11v10"/><path d="M15 14h5"/><path d="m18 11 3 3-3 3"/></svg>) },
  { id:"beds-near-u", l:"Beds Near U", customBeds:true, icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18V8"/><path d="M21 18v-6"/><path d="M3 13h18"/><path d="M5 13V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/><path d="M13 13v-3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/><path d="M3 18v3"/><path d="M21 18v3"/></svg>) },
];

function CardLabel({l, icon}: any){
  return (
    <div className="card-title-top">
      <span className="card-title-icon">{icon}</span>
      <p>{l}</p>
    </div>
  )
}

type User = { id:string; email:string; name:string };

export default function Page(){
  const [rate, setRate] = useState(1008);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"signin"|"signup">("signup");
  const [user, setUser] = useState<User|null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(()=>{
    async function load(){
      try{
        const r = await fetch("https://open.er-api.com/v6/latest/AED");
        const d = await r.json();
        setRate(Math.round(d.rates?.UGX || 1008));
      }catch{ setRate(1008); }
    }
    load();
    const id = setInterval(load, 60000);

    const syncUser = () => {
      try {
        const saved = localStorage.getItem("ug_user");
        setUser(saved ? JSON.parse(saved) as User : null);
      } catch { setUser(null); }
    };
    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("ug_auth_changed" as any, syncUser);

    const token = localStorage.getItem("ug_token");
    if(token){
      fetch(`${WORKER_URL}/api/user/me`, { headers: { Authorization: `Bearer ${token}` }})
        .then(r=> r.ok ? r.json().catch(()=>null) : null)
        .then(d=>{
          if(d?.user){
            setUser(d.user);
            localStorage.setItem("ug_user", JSON.stringify(d.user));
          }
        }).catch(()=>{});
    }

    return ()=>{
      clearInterval(id);
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("ug_auth_changed" as any, syncUser);
    };
  },[]);

  const confirmLogout = () => {
    localStorage.removeItem("ug_token");
    localStorage.removeItem("ug_user");
    localStorage.removeItem("ug_guest");
    setUser(null);
    setLogoutOpen(false);
    setPendingHref(null);
    window.dispatchEvent(new Event("ug_auth_changed"));
  };

  const handleServiceClick = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault();
      setPendingHref(href);
      setModalMode("signup");
      setModalOpen(true);
      return;
    }
    window.location.href = href;
  };

  const handleAuthSuccess = (u:any) => {
    const newUser = u?.user || u;
    setUser(newUser);
    if(newUser) localStorage.setItem("ug_user", JSON.stringify(newUser));
    if(u?.token) localStorage.setItem("ug_token", u.token);
    window.dispatchEvent(new Event("ug_auth_changed"));
    setModalOpen(false);
    
    if (pendingHref) {
      const dest = pendingHref;
      setPendingHref(null);
      setTimeout(() => {
        window.location.href = dest;
      }, 300);
    }
  };

<<<<<<< HEAD
  const handleGuest = async () => {
    const guestUser = { id: "guest_"+Date.now(), name: "Guest", email: "guest@ug.local", isGuest: true };
    localStorage.setItem("ug_user", JSON.stringify(guestUser));
    localStorage.setItem("ug_guest", "1");
    onSuccess?.(guestUser);
    onClose();
  };

  const handleGoogle = async () => {
    setError("Google sign-in - wire your Google Client ID in live-services.config.ts");
  };

  const handleApple = async () => {
    setError("Apple sign-in coming - add Apple Service ID");
  };

  return (
    <div className="ug-modal-overlay" onClick={onClose} style={{ animation: "ugFadeIn 0.25s ease-out" }}>
      <style>{`
        @keyframes ugFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ugSlideUp {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="ug-modal-wrap" onClick={onClose} style={{ animation: "ugSlideUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
        <div className="ug-modal" onClick={(e) => e.stopPropagation()}>

          <button className="ug-modal-close" onClick={onClose}>✕</button>

          <h2 className="ug-modal-title">
            {mode === "signin"? "Sign In to continue" : "Create account"}
          </h2>
          {mode === "signup" ? (
            <>
              <div className="ug-bonus-badge"> INSTANT WELCOME BONUS</div>
              <p className="ug-modal-sub sales"></p>
            </>
          ) : (
  <p className="ug-modal-sub"></p>
)}


          <form onSubmit={handleSubmit} className="ug-modal-form">
            {mode === "signup" && (
              <>
                <div className="ug-avatar-row">
                  <div className="ug-avatar-preview" onClick={()=>fileRef.current?.click()}>
                    {avatarPreview? (
                      <img src={avatarPreview} alt="avatar" />
                    ) : (
                      <span>+</span>
                    )}
                  </div>
                  <div className="ug-avatar-meta">
                    <p onClick={()=>fileRef.current?.click()}>Add avatar (optional)</p>
                    <small>Tap to upload, or skip</small>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
                  {avatarFile && <button type="button" className="ug-avatar-clear" onClick={()=>{setAvatarFile(null); setAvatarPreview("");}}>Remove</button>}
                </div>

                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="ug-input"
                  required
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ug-input"
              required
            />
                       <PasswordInput value={password} onChange={e=>setPassword(e.target.value)} />

            {mode === "signin" && (
              <div style={{ textAlign: "right", marginTop: "8px" }}>
                <span 
                  onClick={() => setError("Password reset - check your email link coming soon")}
                  style={{ fontSize: "13px", textDecoration: "underline", cursor: "pointer" }}
                >
                  Forgot password?
                </span>
              </div>
            )}

            {error && <div className="ug-error">{error}</div>}

            <button type="submit" disabled={loading} className="ug-btn-primary">
              {loading? "Please wait..." : mode === "signin"? "Sign In" : "Sign Up & Continue"}
            </button>

            <p style={{ fontSize: "11px", textAlign: "center", marginTop: "12px", lineHeight: "1.4", opacity: 0.75 }}>
              By continuing you agree to UG-Connect's{" "}
              <a href="/terms" style={{ textDecoration: "underline" }}>Terms</a>,{" "}
              <a href="/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</a> and{" "}
              <a href="/cookies" style={{ textDecoration: "underline" }}>Cookie Policy</a>
            </p>


            <div className="ug-divider"><span>or</span></div>

            <div className="ug-social-grid">
              <button type="button" className="ug-btn-social google" onClick={handleGoogle}>
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button
                type="button"
                className="ug-btn-social apple"
                onClick={handleApple}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M17.05 12.66c-.02-2.24 1.83-3.32 1.91-3.37a4.1 4.1 0 0 0-3.23-1.75c-1.36-.14-2.68.81-3.37.81-.7 0-1.77-.8-2.91-.78a4.29 4.29 0 0 0-3.61 2.2c-1.55 2.69-.39 6.65 1.11 8.83.75 1.07 1.61 2.27 2.76 2.23 1.11-.05 1.53-.72 2.88-.72s1.74.72 2.91.69c1.2-.02 1.94-1.08 2.67-2.16a8.87 8.87 0 0 0 1.22-2.51 3.89 3.89 0 0 1-2.34-3.47ZM14.84 6.1a3.93 3.93 0 0 0 .9-2.85 4 4 0 0 0-2.58 1.34 3.75 3.75 0 0 0-.92 2.73 3.3 3.3 0 0 0 2.6-1.22Z"/>
                </svg>
                Apple
              </button>
            </div>

            <button type="button" className="ug-btn-guest" onClick={handleGuest}>
              Continue as Guest →
            </button>
          </form>

          <div className="ug-modal-switch">
            {mode === "signin"? (
              <p>Don't have account? <span onClick={() => onSwitchMode("signup")}>Sign up</span></p>
            ) : (
              <p>Already have account? <span onClick={() => onSwitchMode("signin")}>Sign in</span></p>
            )}
=======
  return(
  <>
    <div className="landing-root">
      <h1 className="landing-title">Choose your service</h1>
      <div className="grid top-grid">
        {top.map(s=> (
          <div key={s.id} className="card-wrapper">
            <CardLabel l={s.l} icon={s.icon} />
            {s.custom ? (
              <a href={`/${s.id}`} onClick={(e)=>handleServiceClick(e, `/${s.id}`)} className="service-card movies-card"><div className="movies-left"></div><div className="movies-right"><div className="scroller-track"><img src="/scroller.jpg" alt="" /><img src="/scroller.jpg" alt="" /><img src="/scroller.jpg" alt="" /><img src="/scroller.jpg" alt="" /></div></div></a>
            ) : (s as any).customFood ? (
              <a href={`/${s.id}`} onClick={(e)=>handleServiceClick(e, `/${s.id}`)} className="service-card ug-foods-card"><div className="ug-foods-left"></div><div className="ug-foods-right"><div className="foods-stack"><img src="/matooke.jpg" className="stack-img stack-1" alt="" /><img src="/matooke.jpg" className="stack-img stack-2" alt="" /><img src="/matooke.jpg" className="stack-img stack-3" alt="" /></div></div><div className="foods-label"><p>UG Foods</p></div></a>
            ) : (s as any).customMoney ? (
              <a href={`/${s.id}`} onClick={(e)=>handleServiceClick(e, `/${s.id}`)} className="service-card mobile-money-card"><div className="money-bg"></div><div className="money-live-widget"><div className="live-row"><p className="live-label-aed">AED</p><span className="live-arrow">→</span><p className="live-label-ugx">UGX</p></div><h2 className="live-rate">1 AED = {rate.toLocaleString()} UGX</h2><p className="live-sub">Live</p></div></a>
            ) : (<a href={`/${s.id}`} onClick={(e)=>handleServiceClick(e, `/${s.id}`)} className="service-card"><span> </span></a>)}
>>>>>>> 0d487e7ac0e4165aaea5dfa29b72de643127a479
          </div>
        ))}
      </div>

      <div className="grid bottom-grid">
        {bottom.map(s=> (
          <div key={s.id} className="card-wrapper">
            <CardLabel l={s.l} icon={s.icon} />
            {(s as any).customSalon ? (<a href={`/${s.id}`} onClick={(e)=>handleServiceClick(e, `/${s.id}`)} className="service-card salon-card"><div className="salon-bg"></div></a>) : (s as any).customJobs ? (<a href={`/${s.id}`} onClick={(e)=>handleServiceClick(e, `/${s.id}`)} className="service-card jobs-card"><div className="jobs-bg"></div></a>) : (s as any).customCago ? (<a href={`/${s.id}`} onClick={(e)=>handleServiceClick(e, `/${s.id}`)} className="service-card cago-card"><div className="cago-bg"></div></a>) : (s as any).customBeds ? (<a href={`/${s.id}`} onClick={(e)=>handleServiceClick(e, `/${s.id}`)} className="service-card beds-card"><div className="beds-bg"></div></a>) : (<a href={`/${s.id}`} onClick={(e)=>handleServiceClick(e, `/${s.id}`)} className="service-card"><span> </span></a>)}
          </div>
        ))}
      </div>

      <TheHallShell><></></TheHallShell>
      <GetStartedInputGate />
      <FooterFree />

      <SigninModals
        isOpen={modalOpen}
        mode={modalMode}
        onClose={() => { setModalOpen(false); setPendingHref(null); }}
        onSwitchMode={(m) => setModalMode(m)}
        onSuccess={handleAuthSuccess}
      />

      <LogoutModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
        user={user}
      />
    </div>
  </>
);
}