"use client";
import type { DrawerId, DrawerProps } from "./drawer.types";
import UserDrawerShell from "./user-drawer-shell";
import { useUserDrawer } from "../store/use-user-drawer";
import { useAdminUser } from "../hooks/use-admin-user";
import { initialOf, monthYear, timeAgo } from "../utils/format";

const ITEMS: { id: DrawerId; label: string; hint: string }[] = [
  { id: "profile", label: "Profile", hint: "Details and country" },
  { id: "activity", label: "Activity", hint: "Watched, liked, comments" },
  { id: "engagement", label: "Engagement", hint: "Visits and top interactions" },
  { id: "subscription", label: "Subscription", hint: "Plan and billing status" },
  { id: "security", label: "Security", hint: "OTP, sessions, logins" },
  { id: "mail", label: "Send mail", hint: "Personal message" },
  { id: "verification", label: "Verification", hint: "Verified status" },
  { id: "reports", label: "Reports", hint: "Reports about this user" },
];

export default function UserHubDrawer({ userId }: DrawerProps) {
  const open = useUserDrawer((s) => s.open);
  const { data, loading, error, retry } = useAdminUser(userId);

  if (loading) {
    return (
      <UserDrawerShell title="User">
        <div className="ud-card">Loading user...</div>
      </UserDrawerShell>
    );
  }

  if (error || !data) {
    return (
      <UserDrawerShell title="User">
        <div className="ud-card">{error ?? "Could not load this user."}</div>
        <div className="ud-actions">
          <button type="button" className="ud-btn is-ghost" onClick={retry}>
            Try again
          </button>
        </div>
      </UserDrawerShell>
    );
  }

  // FIX: use-admin-user returns FLAT detail { id, name, email, subscription, counts }
  // NOT nested { user }. Handle both so it never crashes on data.user = undefined.
  const user = (data as any).user ?? data;
  const subscription = (data as any).subscription;
  const counts = (data as any).counts ?? { favorites: 0, lists: 0 };
  const label = user.name || user.email || "Unnamed user";
  const inBin = user.status === "pending_deletion";
  const badges = [
    user.verified ? "VERIFIED" : "UNVERIFIED",
    user.premium ? "PREMIUM" : null,
    user.abandoned ? "ABANDONED" : null,
    user.status === "terminated" ? "TERMINATED" : null,
    inBin ? "IN BIN" : null,
  ].filter(Boolean) as string[];

  return (
    <UserDrawerShell title="User">
      <div className="ud-user">
        {user.avatarUrl ? (
          <img
            className="ud-avatar"
            src={user.avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="ud-avatar">{initialOf(label)}</div>
        )}
        <div>
          <div className="ud-user-name">{label}</div>
          <div className="ud-user-meta">{user.email}</div>
          <div className="ud-user-meta">
            {user.country ?? "--"}
            {user.city ? ` · ${user.city}` : ""} · Joined {monthYear(user.joinedAt)}{" "}
            · Active {timeAgo(user.lastActiveAt)}
          </div>
          <div className="ud-user-meta">
            Plan: {subscription?.plan ?? "none"}
            {subscription?.status ? ` (${subscription.status})` : ""} ·{" "}
            {counts?.favorites ?? "-"} favorites · {counts?.lists ?? "-"} lists
          </div>
          <div className="ud-badges">
            {badges.map((b) => (
              <span key={b} className="ud-badge">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="ud-list">
        {ITEMS.map((it) => (
          <button
            key={it.id}
            type="button"
            className="ud-row"
            onClick={() => open(it.id, { userId })}
          >
            <span>
              <div className="ud-row-label">{it.label}</div>
              <div className="ud-row-hint">{it.hint}</div>
            </span>
            <span className="ud-chevron">{"\u203A"}</span>
          </button>
        ))}
      </div>

      <div className="ud-section-label">DANGER ZONE</div>
      {inBin ? (
        <div className="ud-card">
          This account is in the bin. Restore comes with the actions batch.
        </div>
      ) : (
        <div className="ud-list">
          <button
            type="button"
            className="ud-row"
            onClick={() => open("confirm", { userId, action: "terminate" })}
          >
            <span>
              <div className="ud-row-label">Terminate account</div>
              <div className="ud-row-hint">Blocks login, keeps data</div>
            </span>
            <span className="ud-chevron">{"\u203A"}</span>
          </button>
          <button
            type="button"
            className="ud-row"
            onClick={() => open("confirm", { userId, action: "delete" })}
          >
            <span>
              <div className="ud-row-label">Delete account</div>
              <div className="ud-row-hint">Moves to the bin</div>
            </span>
            <span className="ud-chevron">{"\u203A"}</span>
          </button>
        </div>
      )}
    </UserDrawerShell>
  );
}