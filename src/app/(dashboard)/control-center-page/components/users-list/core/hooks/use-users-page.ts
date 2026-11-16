"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminUser, UserCounts, UserFilter } from "../types/admin-user";
import { fetchCounts, fetchUsersPage } from "../api/admin-user-api";
import { errorMessage } from "../api/admin-http";

const PAGE_SIZE = 30;
const MIN_QUERY = 2;
const POLL_MS = 15000; // 👇 re-check every 15s for live status

export function useUsersPage() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [counts, setCounts] = useState<UserCounts | null>(null);

  const [items, setItems] = useState<AdminUser[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const ac = new AbortController();
    fetchCounts(ac.signal)
      .then((s) => setCounts(s.counts))
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const effectiveQ = debouncedQ.length >= MIN_QUERY ? debouncedQ : "";

  const load = useCallback(
    async (reset: boolean, from: string | null) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      setError(null);
      try {
        const page = await fetchUsersPage(
          { cursor: reset ? null : from, q: effectiveQ, filter, limit: PAGE_SIZE },
          ac.signal
        );
        if (ac.signal.aborted) return;
        setItems((prev) => (reset ? page.items : [...prev, ...page.items]));
        setCursor(page.nextCursor);
        setHasMore(page.nextCursor !== null);
        setLoading(false);
      } catch (e) {
        if (ac.signal.aborted) return;
        setError(errorMessage(e));
        setLoading(false);
      }
    },
    [effectiveQ, filter]
  );

  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    load(true, null);
    return () => abortRef.current?.abort();
  }, [load]);

  // 👇 LIVE POLLING — refetch first page every 15s, only when not searching
  useEffect(() => {
    if (effectiveQ) return;
    const t = setInterval(() => {
      load(true, null);
    }, POLL_MS);
    return () => clearInterval(t);
  }, [load, effectiveQ]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore || error) return;
    load(false, cursor);
  }, [loading, hasMore, error, cursor, load]);

  const retry = useCallback(() => {
    if (items.length === 0) load(true, null);
    else load(false, cursor);
  }, [items.length, cursor, load]);

  const resultCount = effectiveQ ? null : counts?.[filter] ?? null;

  return {
    q,
    setQ,
    filter,
    setFilter,
    counts,
    resultCount,
    items,
    loading,
    hasMore,
    error,
    loadMore,
    retry,
  };
}