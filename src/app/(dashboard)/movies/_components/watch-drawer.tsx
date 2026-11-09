import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import WatchClient from "../watch/[id]/watch-client";
import { useMiniPlayerFloating } from "../_components/vid-actions/mini-player-floating-logic";
import { ActorViewPanel } from "../_components/vid-meta-info/actor-view-panel";
import { VJViewPanel } from "../_components/vid-meta-info/vj-view-panel-logic/vj-view-panel";
import "./watch-drawer.css";

function detectMobileDevice() {
  if (typeof window === "undefined") return true;
  const isPhoneUA = /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(navigator.userAgent || "");
  const isTouch = navigator.maxTouchPoints > 0;
  if (isPhoneUA) return true;
  if (window.innerWidth <= 1024) return true;
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
  // MIRROR ONLY — WatchClient's useWatchAnimateToLandscape OWNS fullscreen.
  // Drawer never toggles fullscreen itself, it only mirrors via onFsChange below.
  // This keeps handleClose / fixedLayout correct without a second fullscreen controller.
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  // REMOVED: isExpanding + handleSmoothExpand FLIP.
  // Old code: getBoundingClientRect() + 10x style.setProperty(..., "important") + 520ms transition + manual cleanup.
  // That fought helper (pageSlideIn/pageZoomOut) + wal (width/height transition).
  // NEW: mini -> full is just maximize(). Helper's pageSlideIn + wal transition animate it. No FLIP here.
  const [isPortrait, setIsPortrait] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const update = () => setIsPortrait(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  // video + buttons fixed, rest scrolls: only in portrait, never mini / fullscreen / expanding
  // isExpanding removed — fixedLayout now only checks minimized / isFullscreen / isPortrait
  const fixedLayout = !minimized && !isFullscreen && isPortrait;
  const floating = useMiniPlayerFloating(panelRef, minimized);

  // REMOVED: triggerFsBtn()
  // Old: panel.querySelector(".cc-icon.apple-full")?.click() — fragile hack, clicked inside WatchClient.
  // NEW: Drawer never clicks inside WatchClient. To exit native fullscreen, exit it natively —
  // WatchClient's hook listens to fullscreenchange and syncs isFullscreen itself.

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

  useEffect(()=>{
    let timeout: any = null;
    let lastWidth = typeof window!== "undefined"? window.innerWidth : 0;
    const handleSwitch = () => {
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

  // === SMOOTH EXPAND — REPLACED ===
  // Old handleSmoothExpand() FLIP deleted (see top). Mini -> full is now just maximize().
  // Helper pageSlideIn + wal width/height transition do the animation. No inline styles.
  const handleSmoothExpand = useCallback(() => {
    if (minimized) maximize();
  }, [minimized, maximize]);

  if(!movieId) return null;
  if(!open &&!minimized &&!isClosing) return null;
  if(!isMobile && open &&!minimized) return null;

  const handleClose = () => {
    // If native fullscreen is on, exit it natively — WatchClient hook syncs via fullscreenchange.
    // Do NOT click .apple-full, do NOT setIsFullscreen manually here.
    if(isFullscreen){
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch {}
      try { if ((document as any).webkitFullscreenElement) (document as any).webkitExitFullscreen?.(); } catch {}
      return;
    }
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
    const scroller = panelRef.current?.querySelector(".connect-scroll-area") as HTMLElement | null;
    const scrolledDown = Math.max(scroller?.scrollTop ?? 0, panelRef.current?.scrollTop ?? 0) > 0;
    // KEEP only video->mini, KILL to-fs and exit-fs (cast breaks it)
    dragModeRef.current = getIsVideoZone(y) ? "to-mini" : "none";
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
    else if(dragModeRef.current === "to-fs" || dragModeRef.current === "exit-fs"){
      return; // killed
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
    else if(dragModeRef.current === "to-fs" || dragModeRef.current === "exit-fs"){
      // killed - nothing
    }
    setDragY(0);
    dragModeRef.current = "none";
  };

  const progress = Math.min(Math.abs(dragY)/400, 1);

  return(
    <div className={`watch-drawer-root ${open?"open":""} ${minimized?"is-mini":""} ${dragging?"is-dragging":""} ${isClosing?"closing":""} ${isFullscreen?"is-fullscreen":""} ${showControls?"show-controls":""} ${fixedLayout?"is-fixed-layout":""}`}>
      <div className="watch-drawer-backdrop" style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        opacity: dragging && dragModeRef.current==="to-mini"? 1 - progress : 1
      } as any} onClick={handleClose} />
     <div
        ref={panelRef}
        className={`watch-drawer-panel ${minimized? 'is-mini-floating' : ''} ${floating.isDragging? 'is-dragging' : ''}`}
        style={minimized? floating.floatingStyle : (dragging? { transform: `translate3d(0,${dragY}px,0)` } as any : undefined)}
        onPointerDown={(e) => {
          if (minimized) floating.onPointerDown(e as any);
          else if (!minimized) onDown(e);
        }}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
        onClickCapture={minimized? floating.onClickCapture : undefined}
      >
              <div className="watch-drawer-content" onClick={()=>{
          if(!minimized) return;
          if(!showControls){ setShowControls(true); return; }
          handleSmoothExpand();
        }}>
          <WatchClient id={movieId} isOverlay={true} onClose={handleClose} onExpand={handleSmoothExpand} isMini={minimized} isFullscreen={isFullscreen} onFsChange={setIsFullscreen} />
        </div>
      </div>
      <ActorViewPanel />
      <VJViewPanel />
    </div>
  )
}

