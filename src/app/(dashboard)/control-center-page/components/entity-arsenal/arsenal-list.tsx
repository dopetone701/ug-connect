"use client";
import { useEffect, useState } from "react";
import { listArsenalItems } from "./save-arsenal-item";
import { clearArsenalItem } from "./migrate-live";
import { arsenalDaysLeft } from "./arsenal-constants";
import type { ArsenalItem } from "./arsenal-types";

// src/app/(dashboard)/control-center-page/components/entity-arsenal/arsenal-list.tsx
// Admin Arsenal lineup. Staged + Published + Cleared. 90-day countdown + Clear Now.
// Admin only. Receiver never sees this. Live movies are NOT listed here.

export function ArsenalList({ onPickForCreate }: { onPickForCreate?: (item: ArsenalItem) => void }) {
  const [items, setItems] = useState<ArsenalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [clearingId, setClearingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setErr("");
    try { setItems(await listArsenalItems()); }
    catch (e: any) { setErr(e.message || "Could not load Arsenal"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const clearNow = async (id: string) => {
    if (!confirm("Clear this Arsenal item? Video is deleted from staging. Live movie (if published) stays live.")) return;
    setClearingId(id);
    try { await clearArsenalItem(id); await load(); }
    catch (e: any) { setErr(e.message || "Clear failed"); }
    finally { setClearingId(null); }
  };

  if (loading) return <div className="arsenal-empty">Loading Arsenal...</div>;
  if (err) return <div style={{ padding: 16 }}><span className="arsenal-err">{err}</span><button onClick={load} className="arsenal-btn-ghost" style={{ marginLeft: 12 }}>Retry</button></div>;
  if (!items.length) return <div className="arsenal-empty">Arsenal is empty.<br />Share the Arsenal link with a receiver to get uploads.</div>;

  return (
    <div className="arsenal-list">
      {items.map((item) => {
        const days = arsenalDaysLeft(item.autoClearAt);
        const epCount = item.episodes?.length || 0;
        return (
          <div key={item.id} className="arsenal-card">
            <div className="arsenal-card-top">
              <b>{item.titleHint || "(no title hint)"}</b>
              <span className={`arsenal-badge ${item.status}`}>{item.status.toUpperCase()}</span>
            </div>
            <span className="arsenal-meta">
              {item.type} {item.type === "Series" ? `· ${epCount} episode(s)` : ""} · from {item.uploaderEmail} · {new Date(item.createdAt).toLocaleString()}
            </span>
            {item.status === "published" && days !== null && (
              <span className="arsenal-soon" style={days > 7 ? { color: "hsl(var(--text))" } : undefined}>
                Auto-clears in {days} day{days === 1 ? "" : "s"} · Live: {item.liveMovieId || "-"}
              </span>
            )}
            {item.status === "staged" && <span className="arsenal-meta">Waiting for admin — pick it in Create to publish.</span>}
            <div className="arsenal-row">
              {onPickForCreate && item.status === "staged" && (
                <button onClick={() => onPickForCreate(item)} className="arsenal-btn-primary">
                  Use in Create →
                </button>
              )}
              {item.status !== "cleared" && (
                <button onClick={() => clearNow(item.id)} disabled={clearingId === item.id} className="arsenal-btn-ghost">
                  {clearingId === item.id ? "Clearing..." : "Clear now"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

