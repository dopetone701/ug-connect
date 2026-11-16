import { adminFetch } from "./admin-http";
import type {
  StatsResponse,
  UserCounts,
  UserFilter,
  UsersPage,
} from "../types/admin-user";

export type FetchUsersParams = {
  cursor: string | null;
  q: string;
  filter: UserFilter;
  limit: number;
};

// GET /admin/stats -> { counts: {...} }
export async function fetchCounts(
  signal?: AbortSignal
): Promise<{ counts: UserCounts }> {
  const data = await adminFetch<StatsResponse>("/admin/stats", { signal });
  return { counts: data.counts };
}

// GET /admin/users?cursor=&q=&filter=&limit=
export async function fetchUsersPage(
  params: FetchUsersParams,
  signal?: AbortSignal
): Promise<UsersPage> {
  const sp = new URLSearchParams();
  if (params.cursor) sp.set("cursor", params.cursor);
  if (params.q) sp.set("q", params.q);
  if (params.filter && params.filter !== "all") sp.set("filter", params.filter);
  sp.set("limit", String(params.limit));

  return adminFetch<UsersPage>(`/admin/users?${sp.toString()}`, { signal });
}