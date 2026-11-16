import { adminFetch } from "./admin-http";
import type {
  AdminUserDetail,
  StatsResponse,
  UserFilter,
  UsersPage,
} from "../types/admin-user";

export function fetchUsersPage(
  opts: {
    cursor?: string | null;
    q?: string;
    filter: UserFilter;
    country?: string;
    limit?: number;
  },
  signal?: AbortSignal
): Promise<UsersPage> {
  const p = new URLSearchParams();
  p.set("filter", opts.filter);
  if (opts.q) p.set("q", opts.q);
  if (opts.cursor) p.set("cursor", opts.cursor);
  if (opts.country) p.set("country", opts.country);
  if (opts.limit) p.set("limit", String(opts.limit));
  return adminFetch<UsersPage>(`/admin/users?${p.toString()}`, { signal });
}

export function fetchCounts(signal?: AbortSignal): Promise<StatsResponse> {
  return adminFetch<StatsResponse>("/admin/stats", { signal });
}

export function fetchUserDetail(
  id: string,
  signal?: AbortSignal
): Promise<AdminUserDetail> {
  return adminFetch<AdminUserDetail>(
    `/admin/users/${encodeURIComponent(id)}`,
    { signal }
  );
}


