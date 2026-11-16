"use client";
import { memo } from "react";
import type { AdminUser } from "../core/types/admin-user";
import { initialOf, isActiveToday, timeAgo } from "../core/utils/format";

type Props = {
  user: AdminUser;
  onOpen?: (id: string) => void;
};

function stateTag(u: AdminUser): { text: string; danger: boolean } | null {
  if (u.status === "pending_deletion") return { text: "IN BIN", danger: true };
  if (u.status === "terminated") return { text: "TERMINATED", danger: true };
  if (u.abandoned) return { text: "ABANDONED", danger: false };
  if (!u.verified) return { text: "UNVERIFIED", danger: false };
  return null;
}

function UserRow({ user, onOpen }: Props) {
  const tag = stateTag(user);
  const label = user.name || user.email || "Unnamed user";

  return (
    <button type="button" className="ul-row" onClick={() => onOpen?.(user.id)}>
      <span className="ul-avatar">
        {user.avatarUrl ? (
          <img
            className="ul-avatar-img"
            src={user.avatarUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="ul-avatar-img ul-avatar-fallback">
            {initialOf(label)}
          </span>
        )}
        <span
          className={`ul-dot${isActiveToday(user.lastActiveAt) ? " online" : ""}`}
        />
      </span>

      <span className="ul-main">
        <span className="ul-name">
          <span className="ul-name-text">{label}</span>
          {user.verified ? (
            <span className="ul-check" title="Verified">
              {"\u2713"}
            </span>
          ) : null}
        </span>
        <span className="ul-sub">
          {user.country ?? "--"} · {timeAgo(user.lastActiveAt)}
        </span>
      </span>

      <span className="ul-tags">
        {user.premium ? <span className="ul-tag">PREMIUM</span> : null}
        {tag ? (
          <span className={`ul-tag${tag.danger ? " danger" : ""}`}>
            {tag.text}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export { UserRow };
export default memo(UserRow);