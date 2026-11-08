"use client";

import React, { useEffect, useRef, useState } from "react";
import { API_URL } from "../constants";

type Props = {
  vj: string;
  slogan: string;
  setSlogan: (v: string) => void;
};

type SloganHit = {
  slogan: string;
  vj: string;
  count: number;
};

const norm = (s: string) =>
  (s || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim();

export default function VJSlogan({
  vj,
  slogan,
  setSlogan,
}: Props) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SloganHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<SloganHit[] | null>(null);
  // Latest slogan per VJ — first time we see a VJ in the API list (newest first) = its latest slogan
  const latestByVjRef = useRef<Map<string, string>>(new Map());

  // Prevent late auto-fill from replacing manually entered text.
  const manuallyEditedRef = useRef(false);
  const currentVjRef = useRef(vj);

  useEffect(() => {
    currentVjRef.current = vj;
    manuallyEditedRef.current = false;
  }, [vj]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
    };
  }, []);

  const loadAllSlogans = async (): Promise<SloganHit[]> => {
    if (cacheRef.current) return cacheRef.current;

    try {
      const res = await fetch(`${API_URL}?t=${Date.now()}`, {
        cache: "no-store",
      });

      const data = await res.json();

      const list: any[] = Array.isArray(data)
        ? data
        : data?.movies || data?.data || [];

      const map = new Map<string, SloganHit>();
      const latestByVj = new Map<string, string>();

      for (const m of list) {
        const s = String(
          m?.vj_slogan || m?.slogan || ""
        ).trim();

        if (!s) continue;

        // LATEST per VJ: API list is newest-first, so first time we see this VJ = its latest slogan
        const vjKey = norm(m?.vj || "");
        if (vjKey && !latestByVj.has(vjKey)) {
          latestByVj.set(vjKey, s);
        }

        const key = norm(s);
        const prev = map.get(key);

        if (prev) {
          prev.count += 1;
        } else {
          map.set(key, {
            slogan: s,
            vj: m?.vj || "",
            count: 1,
          });
        }
      }

      latestByVjRef.current = latestByVj;

      const out = [...map.values()].sort(
        (a, b) => b.count - a.count
      );

      cacheRef.current = out;
      return out;
    } catch {
      return [];
    }
  };

  // Auto-fill: always show the CURRENT slogan for this VJ (latest, not most-used).
  // If VJ has no slogan yet -> clear, don't keep previous VJ's slogan.
  // Only if the user has not started editing.
  useEffect(() => {
    if (!vj) return;

    let cancelled = false;
    const targetVj = vj;

    (async () => {
      await loadAllSlogans();

      if (cancelled) return;
      if (currentVjRef.current !== targetVj) return;
      if (manuallyEditedRef.current) return;

      const latest = latestByVjRef.current.get(norm(targetVj));
      if (latest) {
        // Only set if different — avoids wiping a just-typed value on re-render
        if (norm(slogan || "") !== norm(latest)) setSlogan(latest);
      } else {
        // VJ has no slogan yet -> show empty, not previous VJ's slogan
        if ((slogan || "").trim() !== "") setSlogan("");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vj]);

  const searchSlogans = async (query: string) => {
    const q = query.trim();

    if (!q) {
      setResults([]);
      setOpen(false);
      setSearching(false);
      return;
    }

    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);

    const all = await loadAllSlogans();

    if (controller.signal.aborted) return;

    const nq = norm(q);

    const filtered = all
      .filter((h) => norm(h.slogan).includes(nq))
      .sort((a, b) => {
        const aVj = norm(a.vj) === norm(vj) ? 0 : 1;
        const bVj = norm(b.vj) === norm(vj) ? 0 : 1;

        return aVj !== bVj
          ? aVj - bVj
          : b.count - a.count;
      });

    setResults(filtered.slice(0, 8));
    setOpen(true);
    setSearching(false);
  };

  const handleChange = (value: string) => {
    manuallyEditedRef.current = true;
    setSlogan(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchSlogans(value);
    }, 200);
  };

  const showDropdown =
    open && focused && (results.length > 0 || searching);

  const safeSlogan = slogan ?? "";

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        gridColumn: "1 / -1",
      }}
    >
      <label>VJ SLOGAN</label>

      <input
        type="text"
        value={safeSlogan}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => {
          setFocused(true);
          if (safeSlogan.trim()) searchSlogans(safeSlogan);
        }}
        onBlur={() => {
          setTimeout(() => setFocused(false), 150);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder={
          vj
            ? `Slogan for ${vj} — type to search`
            : "Type VJ slogan"
        }
        autoComplete="off"
      />

      {vj && safeSlogan && (
        <small
          style={{
            display: "block",
            marginTop: 5,
            color: "hsl(var(--muted-foreground))",
          }}
        >
          Preview: “{safeSlogan}” — {vj}
        </small>
      )}

      {showDropdown && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            zIndex: 50,
            background: "#111827",
            border: "1px solid #374151",
            borderRadius: 10,
            marginTop: 4,
            overflowY: "auto",
            maxHeight: 260,
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          }}
        >
          {searching && results.length === 0 && (
            <div style={{ padding: "10px 12px" }}>
              Searching…
            </div>
          )}

          {results.map((hit) => (
            <button
              key={hit.slogan}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                manuallyEditedRef.current = true;
                setSlogan(hit.slogan);
                setResults([]);
                setOpen(false);
              }}
              style={{
                display: "flex",
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              <span>
                <strong>{hit.slogan}</strong>
                <small style={{ display: "block", opacity: 0.6 }}>
                  {hit.vj} • Used {hit.count} time{hit.count === 1 ? "" : "s"}
                </small>
              </span>
            </button>
          ))}

          {!searching && results.length > 0 && (
            <div style={{ padding: 8, fontSize: 12, opacity: 0.6 }}>
              Not listed? Keep typing.
            </div>
          )}
        </div>
      )}

      {focused && open && !searching && results.length === 0 &&
        safeSlogan.trim() && (
          <div style={{ fontSize: 12, opacity: 0.6, padding: 4 }}>
            No match. This slogan will be saved with the movie.
          </div>
        )}
    </div>
  );
}

