"use client";
import { useState } from "react";
import UserDrawerShell from "../user-drawer-shell";
import type { DrawerProps } from "../drawer.types";
import { useAdminUser } from "../../hooks/use-admin-user";
import { initialOf, monthYear } from "../../utils/format";

function getLoginType(user: any): string {
  const raw = String(
    user?.authProvider ??
      user?.provider ??
      user?.loginType ??
      user?.login_type ??
      user?.signupMethod ??
      user?.signup_method ??
      user?.auth_provider ??
      ""
  ).toLowerCase();

  if (raw.includes("google") || user?.googleId || user?.google_id) return "Google";
  if (raw.includes("ug") || raw.includes("native") || raw.includes("email") || raw.includes("password"))
    return "UG Connect Native";
  if (!raw) return "UG Connect Native";
  return raw;
}

export default function UserProfileMonitor({ userId }: DrawerProps) {
  const { data, loading, error, retry } = useAdminUser(userId);
  const [imgErr, setImgErr] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, value: string) => {
    if (!value || value === "--") return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  if (loading) {
    return (
      <UserDrawerShell title="Profile">
        <div className="ud-card">Loading profile...</div>
      </UserDrawerShell>
    );
  }

  if (error || !data) {
    return (
      <UserDrawerShell title="Profile">
        <div className="ud-card">{error ?? "Could not load this profile."}</div>
        <div className="ud-actions">
          <button type="button" className="ud-btn is-ghost" onClick={retry}>
            Try again
          </button>
        </div>
      </UserDrawerShell>
    );
  }

  const { user } = data;
  const label = user.name || "Unnamed user";
  const initial = initialOf(label);
  const avatarSrc = user.avatarUrl || "";
  const showImg = Boolean(avatarSrc) && !imgErr;
  const phone = (user as any).phone ?? (user as any).phoneNumber ?? (user as any).phone_number ?? (user as any).mobile ?? "--";
  const loginType = getLoginType(user);
  const locationText = [user.country, user.city].filter(Boolean).join(" · ") || "--";
  const joinedText = user.joinedAt ? monthYear(user.joinedAt) : "--";
  const emailText = user.email || "--";
  const isEmailVerified = Boolean((user as any).verified ?? (user as any).emailVerified ?? (user as any).email_verified);
  const isPhoneVerified = Boolean((user as any).phoneVerified ?? (user as any).phone_verified ?? (user as any).mobileVerified ?? (user as any).mobile_verified);
  const hasPhone = phone !== "--";

  const copyBtnStyle: React.CSSProperties = {
    flexShrink: 0,
    marginLeft: "auto",
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.12)",
    color: "inherit",
    whiteSpace: "nowrap",
  };

  const badgeStyle = (verified: boolean): React.CSSProperties => ({
    fontSize: 10,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 999,
    background: verified ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.15)",
    color: verified ? "#4ade80" : "#fca5a5",
    border: `1px solid ${verified ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.35)"}`,
    whiteSpace: "nowrap",
  });

  const Row = ({ id, label, value, badge }: { id: string; label: string; value: string; badge?: React.ReactNode }) => (
    <div
      className="ud-row"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        width: "100%",
        cursor: "default",
        boxSizing: "border-box",
      }}
    >
      <span style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div className="ud-row-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {label}
          {badge}
        </div>
        <div className="ud-row-hint" style={{ color: "inherit", opacity: 0.9, wordBreak: "break-all" }}>{value}</div>
      </span>
      <button
        type="button"
        onClick={() => copy(id, value)}
        disabled={value === "--"}
        style={{ ...copyBtnStyle, cursor: value === "--" ? "not-allowed" : "pointer", opacity: value === "--" ? 0.4 : 1 }}
      >
        {copied === id ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );

  return (
    <UserDrawerShell title="Profile">
      <div className="ud-user" style={{ alignItems: "center" }}>
        {showImg ? (
          <img
            className="ud-avatar"
            src={avatarSrc}
            alt=""
            referrerPolicy="no-referrer"
            style={{ objectFit: "cover", width: 64, height: 64, fontSize: 24 }}
            onError={() => setImgErr(true)}
            onLoad={() => setImgErr(false)}
          />
        ) : (
          <div className="ud-avatar" style={{ width: 64, height: 64, fontSize: 24 }}>{initial}</div>
        )}
        <div style={{ textAlign: "left" }}>
          <div className="ud-user-name" style={{ fontSize: 18 }}>{label}</div>
          <div className="ud-user-meta">{locationText}</div>
          <div className="ud-user-meta">{loginType}</div>
        </div>
      </div>

      <div className="ud-list" style={{ marginTop: 16 }}>
        <Row
          id="email"
          label="Email"
          value={emailText}
          badge={<span style={badgeStyle(isEmailVerified)}>{isEmailVerified ? "✓ VERIFIED" : "UNVERIFIED"}</span>}
        />
        <Row
          id="phone"
          label="Phone number"
          value={phone}
          badge={
            !hasPhone ? (
              <span style={{ ...badgeStyle(false), background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}>NO PHONE</span>
            ) : (
              <span style={badgeStyle(isPhoneVerified)}>{isPhoneVerified ? "✓ VERIFIED" : "UNVERIFIED"}</span>
            )
          }
        />
        <Row id="location" label="Location" value={locationText} />
        <Row id="joined" label="Joining time" value={joinedText} />
        <div className="ud-row" style={{ display: "flex", alignItems: "center", cursor: "default" }}>
          <span>
            <div className="ud-row-label">Login type</div>
            <div className="ud-row-hint" style={{ color: "inherit", opacity: 0.9 }}>{loginType}</div>
          </span>
        </div>
      </div>

      <p className="ud-user-meta" style={{ marginTop: 12, textAlign: "left" }}>
        Read-only — admin view only
      </p>
    </UserDrawerShell>
  );
}
