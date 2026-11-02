"use client";
import "./refresh-spinner.css";
import { useEffect, useState } from "react";
import { useRefreshSpinner } from "@/stores/use-refresh-spinner";

export default function RefreshSpinner({ targetId, onRefresh }: any) {
  const [els, setEls] = useState<any>({ scrollEl: null, contentEl: null });

  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;
    const inner = root.querySelector(".film-content-inner") || root.querySelector(".landing-content-inner");
    setEls({ scrollEl: root, contentEl: inner });
  }, [targetId]);

  const { pull, progress, state } = useRefreshSpinner({
    scrollEl: els.scrollEl,
    contentEl: els.contentEl,
    onRefresh,
  });

  return (
    <div className="ptr-root" style={{ opacity: state === "refreshing" ? 1 : progress }}>
      <div className="ptr-spinner" style={{ transform: `scale(${0.7 + progress * 0.3})` }}>
        <div className={`ptr-spinner-inner ${pull > 5 || state === "refreshing" ? "spin" : ""}`} />
      </div>
    </div>
  );
}
