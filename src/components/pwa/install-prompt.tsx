"use client";
import { useEffect, useState } from "react";

export default function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const dismissedTime = localStorage.getItem("pwa-dismissed-time");
      if (dismissedTime) {
        const diff = Date.now() - parseInt(dismissedTime, 10);
        const thirtyMins = 30 * 60 * 1000;
        if (diff < thirtyMins) return false; // still within 30 mins, don't show
      }
      return true;
    };

    const handler = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      if (checkTime()) {
        setShow(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    
    // register SW
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(()=>{});
    }

    // also check on mount if prompt already captured but dismissed before
    if (checkTime()) {
      // if user already had prompt saved from earlier session, show after 1s
      setTimeout(() => {
        // @ts-ignore
        if (window.deferredPrompt && checkTime()) setShow(true);
      }, 1000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show) return null;

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      setShow(false);
      localStorage.removeItem("pwa-dismissed-time");
    }
    setDeferred(null);
  };

  const remindLater = () => {
    localStorage.setItem("pwa-dismissed-time", Date.now().toString());
    setShow(false);
    // auto show again after 30 mins if still on site
    setTimeout(() => {
      if (deferred) setShow(true);
    }, 30 * 60 * 1000);
  };

  return (
    <div style={{
      position:"fixed", bottom:"20px", left:"50%", transform:"translateX(-50%)",
      background:"#111", border:"1px solid #333", borderRadius:"16px",
      padding:"14px 18px", display:"flex", alignItems:"center", gap:"12px",
      zIndex:9999, width:"92%", maxWidth:"380px", boxShadow:"0 10px 30px rgba(0,0,0,0.6)"
    }}>
      <img src="/icon.png" alt="logo" style={{width:"42px", height:"42px", borderRadius:"10px", flexShrink:0}} />
      <div style={{flex:1, minWidth:0}}>
        <div style={{color:"#fff", fontWeight:700, fontSize:"14px"}}>Install UG-CONNECT</div>
        <div style={{color:"#aaa", fontSize:"12px"}}>Add to home screen for fast access</div>
      </div>
      <button onClick={install} style={{background:"#FF3B30", color:"#fff", border:"none", borderRadius:"10px", padding:"8px 14px", fontWeight:700, fontSize:"13px", flexShrink:0}}>Install</button>
      <button onClick={remindLater} style={{background:"#222", color:"#ccc", border:"1px solid #333", borderRadius:"10px", padding:"6px 10px", fontSize:"11px", fontWeight:600, whiteSpace:"nowrap"}}>Remind me later</button>
    </div>
  );
}
