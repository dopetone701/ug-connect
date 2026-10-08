"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import WatchClient from "../watch/[id]/watch-client";
import "./watch-drawer.css";

function detectMobileDevice() {
  if (typeof window === "undefined") return true;
  const isPhoneUA = /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(navigator.userAgent || "");
  const isTouch = navigator.maxTouchPoints > 0;
  if (isPhoneUA) return true;
  if (isTouch && window.innerWidth <= 1024) return true;
  return false;
}

export default function WatchDrawer(){
  const router = useRouter();
  const { open, minimized, movieId, playType, closeDrawer, minimize, maximize } = useWatchDrawer() as any;
  const panelRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startTime = useRef(0);
  const dragYRef = useRef(0);
  const dragModeRef = useRef<"none"|"to-mini"|"to-fs"|"exit-fs">("none");
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const triggerFsBtn = useCallback(() => {
    const btn = panelRef.current?.querySelector(".cc-icon.apple-full") as HTMLButtonElement | null;
    if(btn) btn.click();
    else setIsFullscreen(v=>!v);
  }, []);

  useEffect(()=>{
    const check = () => setIsMobile(detectMobileDevice());
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    }
  },[]);

  // === FIXED SWITCH TO PC - NO SWAP DURING FULLSCREEN ===
  useEffect(()=>{
    let timeout: any = null;
    let lastWidth = typeof window!== "undefined"? window.innerWidth : 0;

    const handleSwitch = () => {
      // BULLETPROOF: never switch during fullscreen
      if(isFullscreen) return;
      if(document.fullscreenElement) return;
      if((document as any).webkitFullscreenElement) return;
      if(panelRef.current === document.fullscreenElement) return;

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const curWidth = window.innerWidth;
        const crossedToPC = lastWidth <= 1024 && curWidth > 1024;
        const isPC = curWidth > 1024 && window.matchMedia("(pointer: fine)").matches;
        lastWidth = curWidth;

        if(!crossedToPC ||!isPC) return;
        if(!open || minimized ||!movieId || isClosing) return;

        const t = playType || 'full';
        closeDrawer();
        setIsClosing(false);
        setIsFullscreen(false);
        document.body.style.overflow = '';
        router.push(`/movies/watch/${movieId}?t=${t}`);
      }, 250);
    };

    window.addEventListener("resize", handleSwitch);
    return () => {
      window.removeEventListener("resize", handleSwitch);
      clearTimeout(timeout);
    }
  }, [open, minimized, movieId, playType, isClosing, closeDrawer, router, isFullscreen]);

  useEffect(()=>{
    if(!showControls) return;
    const t = setTimeout(()=> setShowControls(false), 3000);
    return ()=> clearTimeout(t);
  }, [showControls]);

  if(!movieId) return null;
  if(!open &&!minimized &&!isClosing) return null;
  if(!isMobile && open &&!minimized) return null; // PC full drawer never shown

  const handleClose = () => {
    if(isFullscreen){ triggerFsBtn(); return; }
    setIsClosing(true);
    setTimeout(()=> { closeDrawer(); setIsClosing(false); setIsFullscreen(false); document.body.style.overflow = ''; }, 380);
  };

  const getIsVideoZone = (clientY: number) => {
    if(isFullscreen) return false;
    const videoH = window.innerWidth * 0.5625 + 20;
    return clientY < videoH;
  };

  const onDown = (e: any) => {
    if(!isMobile) return;
    if(minimized) return;
    if((e.target as HTMLElement).closest("button")) return;
    const y = e.clientY?? e.touches?.[0]?.clientY;
    if(!y) return;
    startY.current = y;
    startTime.current = Date.now();
    dragYRef.current = 0;
    setDragging(true);
    dragModeRef.current = isFullscreen? "exit-fs" : (getIsVideoZone(y)? "to-mini" : "to-fs");
  };

  const onMove = (e: any) => {
    if(!isMobile) return;
    if(!dragging) return;
    const y = e.clientY?? e.touches?.[0]?.clientY;
    if(!y) return;
    const dy = y - startY.current;
    if(Math.abs(dy) < 12) return;
    if(dragModeRef.current === "to-mini"){
      if(dy < 0) return;
      dragYRef.current = dy;
      setDragY(dy * 0.7);
    }
    else if(dragModeRef.current === "to-fs"){
      if(dy < 0) return;
      dragYRef.current = dy;
      setDragY(Math.min(dy * 0.08, 32));
    }
    else if(dragModeRef.current === "exit-fs"){
      if(dy > 0) return;
      dragYRef.current = dy;
      setDragY(dy * 0.7);
    }
  };

  const onUp = () => {
    if(!isMobile) return;
    if(!dragging) return;
    setDragging(false);
    const elapsed = Date.now() - startTime.current;
    const dy = dragYRef.current;
    const velocity = Math.abs(dy) / Math.max(elapsed, 1);
    if(dragModeRef.current === "to-mini"){
      if(dy > 140 && elapsed > 180) minimize();
    }
    else if(dragModeRef.current === "to-fs"){
      if(velocity > 0.9){
      } else if(dy > 180 && elapsed > 250){
        triggerFsBtn();
      }
    }
    else if(dragModeRef.current === "exit-fs"){
      if(dy < -90) triggerFsBtn();
    }
    setDragY(0);
    dragModeRef.current = "none";
  };

  const progress = Math.min(Math.abs(dragY)/400, 1);

  return(
    <div className={`watch-drawer-root ${open?"open":""} ${minimized?"is-mini":""} ${dragging?"is-dragging":""} ${isClosing?"closing":""} ${isFullscreen?"is-fullscreen":""} ${showControls?"show-controls":""}`}>
      <div className="watch-drawer-backdrop" style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        opacity: dragging && dragModeRef.current==="to-mini"? 1 - progress : 1
      } as any} onClick={handleClose} />
      <div ref={panelRef} className="watch-drawer-panel" style={dragging? { transform: `translate3d(0,${dragY}px,0)` } as any : undefined} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}>
        <div className="watch-drawer-content" onClick={()=>{
          if(!minimized) return;
          if(!showControls){ setShowControls(true); return; }
          maximize();
        }}>
          <WatchClient id={movieId} isOverlay={true} onClose={handleClose} onExpand={maximize} isMini={minimized} isFullscreen={isFullscreen} onFsChange={setIsFullscreen} />
        </div>
      </div>
    </div>
  )
}
