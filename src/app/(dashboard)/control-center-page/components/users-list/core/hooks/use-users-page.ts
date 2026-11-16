"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminUser, UserCounts, UserFilter } from "../types/admin-user";
import { fetchCounts, fetchUsersPage } from "../api/admin-user-api";
import { errorMessage } from "../api/admin-http";

const PAGE_SIZE = 30;
const MIN_QUERY = 2; // the server needs at least 2 characters to search

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

  // Wait 300ms after typing stops before asking the server.
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
          {
            cursor: reset ? null : from,
            q: effectiveQ,
            filter,
            limit: PAGE_SIZE,
          },
          ac.signal
        );
        if (ac.signal.aborted) return;
        setItems((prev) => (reset ? page.items : [...prev, ...page.items]));
        setCursor(page.nextCursor);
        setHasMore(page.nextCursor !== null);
        setLoading(false);
      } catch (e) {
        if (ac.signal.aborted) return; // replaced by a newer request
        setError(errorMessage(e));
        setLoading(false);
      }
    },
    [effectiveQ, filter]
  );

  // Search or filter changed: start again from page 1.
  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    load(true, null);
    return () => abortRef.current?.abort();
  }, [load]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore || error) return;
    load(false, cursor);
  }, [loading, hasMore, error, cursor, load]);

  const retry = useCallback(() => {
    if (items.length === 0) load(true, null);
    else load(false, cursor);
  }, [items.length, cursor, load]);

  // Exact total is known only when no search text is applied.
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


