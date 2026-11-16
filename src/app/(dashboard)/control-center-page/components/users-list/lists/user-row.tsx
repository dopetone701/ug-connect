"use client";
import { memo } from "react";
import type { AdminUser } from "../core/types/admin-user";
import { initialOf, isActiveToday, timeAgo } from "../core/utils/format";

type Props = {
  user: AdminUser & { isAdmin?: boolean };
  onOpen?: (id: string) => void;
  isMe?: boolean;
};

function shortId(id: string) {
  return id ? id.slice(0, 8) : "--";
}

function handleOf(u: AdminUser) {
  const base = (u.name || u.email || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);
  return `@${base || "user"}`;
}

function UserRow({ user, onOpen, isMe }: Props) {
  const label = user.name || user.email || "Unnamed user";
  const online = isActiveToday(user.lastActiveAt);
  const isAdmin = Boolean(user.isAdmin) || Boolean(isMe);

  return (
    <>
      {/* breathing dot animation — DNA green only */}
      <style>{`@keyframes ug-breathe { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.55); } 70% { box-shadow: 0 0 0 7px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }`}</style>
      <button
        type="button"
        onClick={() => onOpen?.(user.id)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          padding: "12px 4px",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* AVATAR — same as everyone, no gold */}
        <span style={{ position: "relative", flexShrink: 0 }}>
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#3b3b3b",
                color: "#fff",
                fontSize: 20,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {initialOf(label)}
            </span>
          )}
          <span
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: online ? "#22c55e" : "#666",
              border: "2px solid #1a1a1a",
            }}
          />
        </span>

        {/* NAME + ID */}
        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {label}
            {user.verified ? <span style={{ color: "#20d5ec", fontSize: 14 }}>✓</span> : null}
            {isAdmin ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.35)",
                    padding: "2px 6px",
                    borderRadius: 999,
                  }}
                >
                  ADMIN
                </span>
                {/* breathing signal dot — right next to ADMIN chip, nothing else */}
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#22c55e",
                    animation: "ug-breathe 2s infinite",
                    flexShrink: 0,
                  }}
                />
              </span>
            ) : null}
          </span>
          <span style={{ color: "#999", fontSize: 13 }}>
            {handleOf(user)} · ID {shortId(user.id)}
          </span>
        </span>

        <span style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#999", fontSize: 13 }}>{timeAgo(user.lastActiveAt)}</span>
          <span style={{ color: "#666", fontSize: 20 }}>›</span>
        </span>
      </button>
    </>
  );
}

export { UserRow };
export default memo(UserRow);