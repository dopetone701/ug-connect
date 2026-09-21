"use client";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import WatchClient from "../watch/[id]/watch-client";
import "./watch-drawer.css";

export default function WatchDrawer() {
  const { open, movieId, closeDrawer } = useWatchDrawer();

  if (!movieId) return null;

  return (
    <div className={`watch-drawer-root ${open ? "open" : "closing"}`}>
      <div className="watch-drawer-backdrop" onClick={closeDrawer} />
      <div className="watch-drawer-panel">
        {/* drag handle */}
        <button className="watch-drawer-handle" onClick={closeDrawer} aria-label="Close" />
        
        {/* WHOLE WATCH PAGE CONTENT */}
        <div className="watch-drawer-content">
          <WatchClient id={movieId} isOverlay={true} onClose={closeDrawer} />
        </div>
      </div>
    </div>
  );
}
