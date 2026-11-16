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

  // 👇 LIVE USERS — from /admin/stats top-level, not from counts
  const [liveUsers, setLiveUsers] = useState<number | null>(null);
  const [liveUsersAvailable, setLiveUsersAvailable] = useState(false);

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

  // 👇 Single place that fetches counts + liveUsers
  const refreshCounts = useCallback(async (signal?: AbortSignal) => {
    try {
      const s: any = await fetchCounts(signal);
      // Worker returns: { counts: {...}, liveUsers: 2, liveUsersAvailable: true }
      // Support both top-level and inside counts, just in case
      const rawLive = s?.liveUsers ?? s?.counts?.liveUsers ?? null;
      const available =
        s?.liveUsersAvailable ?? s?.counts?.liveUsersAvailable ?? (typeof rawLive === "number");

      setCounts(s?.counts ?? s ?? null);
      setLiveUsers(typeof rawLive === "number" ? rawLive : null);
      setLiveUsersAvailable(Boolean(available));
    } catch {
      // keep previous counts/live on failure — do not show fake 0
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    refreshCounts(ac.signal);
    return () => ac.abort();
  }, [refreshCounts]);

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

  // 👇 LIVE POLLING — refetch list AND counts every 15s, only when not searching
  useEffect(() => {
    if (effectiveQ) return;
    const t = setInterval(() => {
      load(true, null);
      refreshCounts();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [load, effectiveQ, refreshCounts]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore || error) return;
    load(false, cursor);
  }, [loading, hasMore, error, cursor, load]);

  const retry = useCallback(() => {
    if (items.length === 0) load(true, null);
    else load(false, cursor);
    refreshCounts();
  }, [items.length, cursor, load, refreshCounts]);

  // 👇 Control Center calls this every 15s
  const refetch = useCallback(() => {
    refreshCounts();
    if (!effectiveQ) load(true, null);
  }, [refreshCounts, load, effectiveQ]);

  const resultCount = effectiveQ ? null : counts?.[filter] ?? null;

  return {
    q,
    setQ,
    filter,
    setFilter,
    counts,
    liveUsers,
    liveUsersAvailable,
    resultCount,
    items,
    loading,
    hasMore,
    error,
    loadMore,
    retry,
    refetch,
  };
}
