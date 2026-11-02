// src/app/refresh-spinner.tsx
"use client";
import "./refresh-spinner.css";
import { useEffect, useRef, useState } from "react";
import { useRefreshSpinner } from "@/stores/use-refresh-spinner";

export default function RefreshSpinner({ 
  onRefresh,
  targetId = "landing-root" // reusable - change id for any section
}: { 
  onRefresh?: () => Promise<void>;
  targetId?: string;
}) {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    setScrollEl(document.querySelector(`.${targetId}`) as HTMLElement || document.getElementById(targetId) as HTMLElement);
  }, [targetId]);

  const handleRefresh = async () => {
    if (onRefresh) await onRefresh();
    else window.location.reload();
  };

  const { pull, state, progress } = useRefreshSpinner({
    scrollEl,
    onRefresh: handleRefresh,
    threshold: 78
  });

  if (pull === 0 && state === "idle") return null;

   return (
    <div 
      className="ptr-root" 
      style={{ 
        transform: `translateY(${pull}px)`,
        opacity: pull > 0 ? 1 : 0
      }}
      data-state={state}
    >
      <div className="ptr-spinner" style={{ transform: `rotate(${progress * 360}deg) scale(${0.6 + progress * 0.4})` }}>
        <div className="ptr-spinner-inner" data-ready={state === "ready"} data-refreshing={state === "refreshing"} />
      </div>
    </div>
  );

}
