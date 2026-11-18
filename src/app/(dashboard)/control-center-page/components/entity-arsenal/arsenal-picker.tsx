// src/app/(dashboard)/control-center-page/components/entity-arsenal/arsenal-picker.tsx
// FROM SCRATCH - Inside Create: pick Single / Series from Arsenal instead of device files.
// Returns ArsenalSelection (keys only). Create then fills details + cover/previews + migrates on Submit.
// Does NOT upload anything. Does NOT touch use-create-movie-form / use-create-movie-upload.
"use client";
import { useEffect, useState } from "react";
import { listArsenalItems } from "./save-arsenal-item";
import { arsenalDaysLeft } from "./arsenal-constants";
import type { ArsenalItem, ArsenalSelection } from "./arsenal-types";

export function ArsenalPicker({ onSelect, onBack }: { onSelect: (sel: ArsenalSelection) => void; onBack: () => void }) {
  const [items, setItems] = useState<ArsenalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    listArsenalItems().then((all) => setItems(all.filter((i) => i.status === "staged"))).catch((e: any) => setErr(e.message || "Could not load Arsenal")).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 12, opacity: 0.7 }}>Loading Arsenal...</div>;
  if (err) return <div style={{ padding: 12 }}><span style={{ color: "#ff6b6b" }}>{err}</span></div>;
  if (!items.length) return <div style={{ padding: 12, opacity: 0.7 }}>No staged Arsenal uploads. Receiver must send one first.<button onClick={onBack} style={{ display: "block", marginTop: 8 }}>← Back to Device upload</button></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button onClick={onBack} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "hsl(var(--text-muted))", cursor: "pointer" }}>← Back to Device upload</button>
      {items.map((item) => {
        const days = arsenalDaysLeft(item.autoClearAt);
        return (
          <button key={item.id} onClick={() => onSelect({ item, liveKeys: [] })}
            style={{ textAlign: "left", border: "1px solid hsl(var(--border))", background: "hsl(var(--surface))", color: "hsl(var(--text))", borderRadius: 14, padding: 14, cursor: "pointer", display: "flex", flexDirection: "column", gap: 4 }}>
            <b>{item.titleHint || "(no title hint)"}</b>
            <span style={{ fontSize: 13, opacity: 0.7 }}>
              {item.type} {item.type === "Series" ? `· ${item.episodes.length} episode(s)` : ""} · from {item.uploaderEmail} · {new Date(item.createdAt).toLocaleString()}
            </span>
            <span style={{ fontSize: 13, opacity: 0.7 }}>
              {item.type === "Single" ? item.arsenalKey : `${item.episodes.length} file(s) in R2A`} {days !== null ? `· clears in ${days}d` : ""}
            </span>
            <span style={{ fontSize: 13, color: "hsl(var(--primary))", fontWeight: 700 }}>Pick this → fill details → Submit migrates it</span>
          </button>
        );
      })}
    </div>
  );
}

