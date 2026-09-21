"use client";
import { useRef, useState, useEffect } from "react";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import WatchClient from "../watch/[id]/watch-client";
import "./watch-drawer.css";

export default function WatchDrawer(){
  const { open, minimized, movieId, closeDrawer, minimize, maximize } = useWatchDrawer();
  const startY = useRef(0);
  const dragYRef = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(()=>{
    if(!showControls) return;
    const t = setTimeout(()=> setShowControls(false), 3000);
    return ()=> clearTimeout(t);
  }, [showControls]);

  if(!movieId) return null;
  if(!open &&!minimized) return null;

  const onDown = (e: any) => {
    if(minimized) return;
    if((e.target as HTMLElement).closest("button")) return;
    startY.current = e.clientY?? e.touches?.[0]?.clientY;
    dragYRef.current = 0;
    setDragging(true);
  };
  const onMove = (e: any) => {
    if(!dragging || minimized) return;
    const y = e.clientY?? e.touches?.[0]?.clientY;
    if(!y) return;
    const dy = y - startY.current;
    if(dy > 0){
      dragYRef.current = dy;
      setDragY(dy);
    }
  };
  const onUp = () => {
    if(!dragging) return;
    setDragging(false);
    if(dragYRef.current > 80) minimize();
    setDragY(0);
  };

  return(
    <div className={`watch-drawer-root ${open?"open":""} ${minimized?"is-mini":""} ${dragging?"is-dragging":""} ${showControls?"show-controls":""}`}>
      <div className="watch-drawer-backdrop" onClick={closeDrawer} />
      <div
        className="watch-drawer-panel"
        style={dragging &&!minimized? { transform: `translate3d(0,${dragY}px,0)`, transition:"none" } : undefined}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
      >
        <div className="watch-drawer-handle" />
        <div
          className="watch-drawer-content"
          onClick={()=>{
            if(!minimized) return;
            if(!showControls){ setShowControls(true); return; }
            maximize();
          }}
        >
          <WatchClient id={movieId} isOverlay={true} onClose={closeDrawer} onExpand={maximize} isMini={minimized} />
        </div>
      </div>
    </div>
  )
}
