"use client";
import { useCallback, useEffect, useState } from "react";
import type { AdminUserDetail } from "../types/admin-user";
import { adminFetch } from "../api/admin-http";

type DetailResponse = {
  user?: AdminUserDetail;
  subscription?: unknown;
  counts?: unknown;
} & Partial<AdminUserDetail>;

// 👇 NAMED export — hub does: import { useAdminUser } from "../hooks/use-admin-user"
export function useAdminUser(userId: string | null) {
  const [data, setData] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const body = await adminFetch<DetailResponse>(`/admin/users/${userId}`);
      // Worker returns { user, subscription, counts } — unwrap it
      const detail = body.user
        ? { ...body.user, subscription: body.subscription, counts: body.counts }
        : (body as unknown as AdminUserDetail);
      setData(detail as AdminUserDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load user");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, retry: load };
}