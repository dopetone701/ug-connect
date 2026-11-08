"use client";
import React, { useEffect, useRef, useState } from "react";
import { API_URL } from "../constants";

type Props = {
  vj: string;
  slogan: string;
  setSlogan?: (v: string) => void;
};

type SloganHit = {
  slogan: string;
  vj: string;
  count: number;
};

const norm = (s: string) =>
  (s || "").trim().toLowerCase().normalize("NFKD").replace(/\s+/g, " ").replace(/[^\p{L}\p{N}\s]/gu, "").trim();

export default function VJSlogan({ vj, slogan = "", setSlogan = () => {} }: Props) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SloganHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);
  // Saved slogan for THIS VJ — shown as placeholder in Edit modal
  const [savedPlaceholder, setSavedPlaceholder] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAutoVj = useRef("");
  const cacheRef = useRef<SloganHit[] | null>(null);
  // Latest slogan per VJ — first time we see a VJ in API list (newest first) = its latest
  const latestByVjRef = useRef<Map<string, string>>(new Map());

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Fetch all distinct slogans from existing movies — NO hard-code, true in D1
  const loadAllSlogans = async (): Promise<SloganHit[]> => {
    if (cacheRef.current) return cacheRef.current;
    try {
      const res = await fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json().catch(() => null);
      const list: any[] = Array.isArray(data) ? data : data?.movies || data?.data || [];
      const map = new Map<string, SloganHit>();
      const latestByVj = new Map<string, string>();
      for (const m of list) {
        const s = String(m?.vj_slogan || m?.slogan || "").trim();
        if (!s) continue;
        // LATEST per VJ: API list is newest-first, first time we see this VJ = latest slogan
        const vjKey = norm(m?.vj || "");
        if (vjKey && !latestByVj.has(vjKey)) latestByVj.set(vjKey, s);
        const key = norm(s);
        const prev = map.get(key);
        if (prev) prev.count += 1;
        else map.set(key, { slogan: s, vj: m?.vj || "", count: 1 });
      }
      latestByVjRef.current = latestByVj;
      const out = [...map.values()].sort((a, b) => b.count - a.count);
      cacheRef.current = out;
      return out;
    } catch { return []; }
  };

  // AUTO-FILL + PLACEHOLDER: when VJ changes, show saved slogan for THAT VJ
  // - Sets value so Save keeps it even if you don't touch it
  // - Sets placeholder so Edit modal shows it as placeholder
  // - If VJ has no saved slogan, clears both
  useEffect(() => {
    if (!vj) { setSavedPlaceholder(""); return; }
    if (lastAutoVj.current === vj) return;
    lastAutoVj.current = vj;
    let cancelled = false;
    (async () => {
      await loadAllSlogans();
      if (cancelled) return;
      const latest = latestByVjRef.current.get(norm(vj));
      if (latest) {
        setSavedPlaceholder(latest);
        // Fill value too — placeholder alone does NOT save, value does.
        // Only fill if current value is empty or is the old VJ's slogan (avoid wiping manual typing on re-render)
        if (!(slogan || "").trim()) setSlogan(latest);
      } else {
        setSavedPlaceholder("");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vj]);

  const searchSlogans = async (query: string) => {
    const q = (query || "").trim();
    if (q.length < 1) { setResults([]); setOpen(false); return; }
    setSearching(true);
    const all = await loadAllSlogans();
    const nq = norm(q);
    const filtered = all.filter((h) => norm(h.slogan).includes(nq));
    // Current VJ's slogans first
    filtered.sort((a, b) => {
      const aVj = norm(a.vj) === norm(vj) ? 0 : 1;
      const bVj = norm(b.vj) === norm(vj) ? 0 : 1;
      if (aVj !== bVj) return aVj - bVj;
      return b.count - a.count;
    });
    setResults(filtered.slice(0, 8));
    setOpen(true);
    setSearching(false);
  };

  const showDropdown = open && focused && (results.length > 0 || searching);

  // Placeholder rule: saved slogan for this VJ wins, otherwise generic hint
  // Example: VJ Baba saved "Baba the King" -> placeholder shows "Baba the King"
  const placeholderText = savedPlaceholder
    ? savedPlaceholder
    : vj
      ? `Slogan for ${vj} — type to search`
      : "Type VJ slogan";

  return (
    <div ref={wrapRef} style={{ position: "relative", gridColumn: "1 / -1" }}>
      <label>VJ SLOGAN</label>
      <input
        value={slogan || ""}
        onChange={(e) => {
          setSlogan(e.target.value);
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => searchSlogans(e.target.value), 200);
        }}
        onFocus={() => { setFocused(true); if ((slogan || "").trim()) searchSlogans(slogan || ""); }}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
        placeholder={placeholderText}
        autoComplete="off"
      />
      {/* Always show saved slogan for this VJ, even if input is empty — this is the placeholder you asked for */}
      {vj && savedPlaceholder ? (
        <small style={{ display: "block", marginTop: 5, color: "hsl(var(--muted-foreground))" }}>
          Saved for {vj}: “{savedPlaceholder}”
        </small>
      ) : null}
      {vj && slogan && slogan !== savedPlaceholder ? (
        <small style={{ display: "block", marginTop: 5, color: "hsl(var(--muted-foreground))" }}>
          Preview: “{slogan}” — {vj}
        </small>
      ) : null}

      {showDropdown ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 50, background: "#111827", border: "1px solid #374151", borderRadius: 10, marginTop: 4, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.45)", maxHeight: 260, overflowY: "auto" }}>
          {searching && results.length === 0 ? <div style={{ padding: "10px 12px", fontSize: 13, opacity: 0.7 }}>Searching…</div> : null}
          {results.map((hit) => (
            <button key={hit.slogan} type="button" onMouseDown={(e) => { e.preventDefault(); setSlogan(hit.slogan); setSavedPlaceholder(hit.slogan); setResults([]); setOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "8px 10px", background: "transparent", border: "none", cursor: "pointer", color: "#fff" }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hit.slogan}</span>
                <span style={{ display: "block", fontSize: 11, opacity: 0.6 }}>{hit.vj} • Used {hit.count} time{hit.count === 1 ? "" : "s"}</span>
              </span>
              <span style={{ fontSize: 12, opacity: 0.5 }}>Select →</span>
            </button>
          ))}
          {!searching && results.length > 0 ? <div style={{ padding: "8px 12px", fontSize: 12, opacity: 0.6, borderTop: "1px solid #1f2937" }}>Not listed? Keep typing — it will be saved on Save.</div> : null}
        </div>
      ) : null}
      {focused && open && !searching && results.length === 0 && (slogan || "").trim().length > 0 ? (
        <div style={{ fontSize: 12, opacity: 0.6, padding: "4px 2px 0" }}>No match — “{(slogan || "").trim()}” will be saved as a new slogan on Save.</div>
      ) : null}
    </div>
  );
}