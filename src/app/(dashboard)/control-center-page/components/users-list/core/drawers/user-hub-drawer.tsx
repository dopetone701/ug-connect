"use client";
import type { DrawerId, DrawerProps } from "./drawer.types";
import UserDrawerShell from "./user-drawer-shell";
import { useUserDrawer } from "../store/use-user-drawer";

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

// Mock data until use-admin-user.ts is wired to the real API.
const MOCK_USER = {
  name: "Mock User",
  email: "mock.user@example.com",
  badges: ["VERIFIED", "PREMIUM"],
  joined: "Jan 2026",
  lastActive: "2 hours ago",
  visits: 128,
};

export default function UserHubDrawer({ userId }: DrawerProps) {
  const open = useUserDrawer((s) => s.open);

  return (
    <UserDrawerShell title="User">
      <div className="ud-user">
        <div className="ud-avatar">{MOCK_USER.name.slice(0, 1)}</div>
        <div>
          <div className="ud-user-name">{MOCK_USER.name}</div>
          <div className="ud-user-meta">
            Joined {MOCK_USER.joined} · Active {MOCK_USER.lastActive} · {MOCK_USER.visits} visits
          </div>
          <div className="ud-badges">
            {MOCK_USER.badges.map((b) => (
              <span key={b} className="ud-badge">{b}</span>
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
    </UserDrawerShell>
  );
}


