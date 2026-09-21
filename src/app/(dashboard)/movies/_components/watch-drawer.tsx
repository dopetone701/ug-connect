"use client";
import { useRef, useState } from "react";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import WatchClient from "../watch/[id]/watch-client";
import "./watch-drawer.css";

export default function WatchDrawer(){
  const { open, minimized, movieId, closeDrawer, minimize, maximize } = useWatchDrawer();
  const startY = useRef(0);
  const dragYRef = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  if(!movieId) return null;
  if(!open &&!minimized) return null;

  const onDown = (e: any) => {
    if(minimized) return;
    // don't drag if clicking buttons
    if((e.target as HTMLElement).closest("button")) return;
    const y = e.clientY?? e.touches?.[0]?.clientY;
    startY.current = y;
    dragYRef.current = 0;
    setDragging(true);
  };

  const onMove = (e: any) => {
    if(!dragging) return;
    const y = e.clientY?? e.touches?.[0]?.clientY;
    if(!y) return;
    const dy = y - startY.current;
    if(dy > 0){
      dragYRef.current = dy;
      setDragY(dy);
      e.preventDefault?.();
    }
  };

  const onUp = () => {
    if(!dragging) return;
    setDragging(false);
    if(dragYRef.current > 80){
      minimize(); // FALL TO BUBBLE ON MOVIES HOMEPAGE
    }
    setDragY(0);
    dragYRef.current = 0;
    startY.current = 0;
  };

  return(
    <div className={`watch-drawer-root ${open?"open":""} ${minimized?"is-mini":""} ${dragging?"is-dragging":""}`}>
      <div className="watch-drawer-backdrop" onClick={closeDrawer} />
      <div
        className="watch-drawer-panel"
        style={dragging? { transform: `translate3d(0,${dragY}px,0)`, transition:"none" } : undefined}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
      >
        <div className="watch-drawer-handle" />

        <div className="watch-drawer-content" onClick={minimized? maximize : undefined}>
          <WatchClient id={movieId} isOverlay={true} onClose={closeDrawer} isMini={minimized} />
          {minimized && (
            <>
              <button className="bubble-close" onClick={(e)=>{e.stopPropagation(); closeDrawer();}}>✕</button>
              <button className="bubble-expand" onClick={(e)=>{e.stopPropagation(); maximize();}}>⤢</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
