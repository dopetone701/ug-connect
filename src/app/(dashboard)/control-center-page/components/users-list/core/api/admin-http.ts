const BASE = (
  process.env.NEXT_PUBLIC_ADMIN_API_URL ??
  "https://ug-admin-api.connectu89.workers.dev"
).replace(/\/+$/, "");

export class AdminApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// The server decides who is an admin. The browser only sends the user's token.
export async function adminFetch<T>(
  path: string,
  init: { signal?: AbortSignal } = {}
): Promise<T> {
  if (!BASE) throw new AdminApiError(0, "NEXT_PUBLIC_ADMIN_API_URL is not set");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("ug_token") : null;
  if (!token) throw new AdminApiError(401, "Not signed in");

  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    signal: init.signal,
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON body
  }

  if (!res.ok) {
    const msg =
      (data as { error?: string } | null)?.error ??
      `Request failed (${res.status})`;
    throw new AdminApiError(res.status, msg);
  }
  return data as T;
}

export function errorMessage(e: unknown): string {
  if (e instanceof AdminApiError) {
    if (e.status === 401 || e.status === 403) {
      return "Admin access required. Sign in with an admin account.";
    }
    return e.message;
  }
  return "Something went wrong.";
}


