"use client";

import { useState, useEffect } from "react";
import "./user-account-page.css";
import type { SheetId } from "./account-sheets";

import LibraryIcon from "@/modal-generator/svg-icons/library-icon";
import DownloadIcon from "@/modal-generator/svg-icons/download-icon";
import BellIcon from "@/modal-generator/svg-icons/bell-icon";
import SubscriptionIcon from "@/modal-generator/svg-icons/subscription-icon";
import GridMenuIcon from "@/modal-generator/svg-icons/grid-menu-icon";

const WORKER_URL =
  "https://user-account-server-api.connectu89.workers.dev";

type RealUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  avatar?: string;
  isGuest?: boolean;
};

type Props = {
  onEdit?: () => void;
  onSelect?: (id: SheetId) => void;
};

export default function UserAccountPage({
  onEdit,
  onSelect,
}: Props) {
  const [user, setUser] = useState<RealUser | null>(null);
  const [imgErr, setImgErr] = useState(false);

  const loadUser = async () => {
    try {
      const raw = localStorage.getItem("ug_user");

      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      }

      const token = localStorage.getItem("ug_token");

      if (!token) return;

      const res = await fetch(`${WORKER_URL}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const fresh = data.user || data;

        setUser(fresh);
        localStorage.setItem(
          "ug_user",
          JSON.stringify(fresh)
        );
      }
    } catch (e) {
      console.log("loadUser failed", e);
    }
  };

  useEffect(() => {
    loadUser();

    const onAuthChanged = () => {
      loadUser();
    };

    window.addEventListener(
      "ug-auth-changed",
      onAuthChanged
    );

    window.addEventListener(
      "storage",
      onAuthChanged
    );

    return () => {
      window.removeEventListener(
        "ug-auth-changed",
        onAuthChanged
      );

      window.removeEventListener(
        "storage",
        onAuthChanged
      );
    };
  }, []);

  if (!user) {
    return (
      <div className="page">
        <div className="header">
          <p
            style={{
              color: "hsl(var(--text-muted))",
              fontSize: "13px",
            }}
          >
            No account — sign in
          </p>
        </div>
      </div>
    );
  }

  const initial =
    user.name?.charAt(0)?.toUpperCase() || "U";

  const avatarSrc =
    user.avatarUrl || user.avatar || "";

  const showImg =
    Boolean(avatarSrc) && !imgErr;

  const handleEdit = () => {
    try {
      const token =
        localStorage.getItem("ug_token");

      const isGuest =
        user?.isGuest ||
        !token ||
        localStorage.getItem("ug_guest") === "1";

      if (isGuest) {
        window.dispatchEvent(
          new CustomEvent("ug-open-signin")
        );

        return;
      }
    } catch {}

    onEdit?.();
    onSelect?.("edit");
  };

  return (
    <div className="page">

      {/* EDIT */}
      <button
        className="editBtn"
        onClick={handleEdit}
        type="button"
      >
        Edit
      </button>

      {/* PROFILE HEADER */}
      <div className="header">

        <div className="avatarWrap flame">
          <div className="avatarInner">
            {showImg ? (
              <img
                src={avatarSrc}
                alt={user.name}
                className="avatar"
                onError={() => setImgErr(true)}
              />
            ) : (
              <span className="fallback">
                {initial}
              </span>
            )}
          </div>
        </div>

        <h2 className="name">
          {user.name}{" "}
          {user.isGuest && "(Guest)"}
        </h2>

        <p className="email">
          {user.email}
        </p>
      </div>

      {/* ACTION ICONS */}
      <div className="cubesRow">

        {/* SUBSCRIPTIONS */}
        <div className="cubeItem">
          <button
            className="cube"
            onClick={() =>
              onSelect?.(
                "subscriptions" as SheetId
              )
            }
            aria-label="Subscriptions"
            type="button"
          >
            <SubscriptionIcon
              size={28}
              color="hsl(var(--text-muted))"
              playColor="hsl(var(--surface))"
              className="cubeIconSvg"
            />
          </button>

          <span className="cubeLabelOutside">
            Subs
          </span>
        </div>

        {/* LIBRARY */}
        <div className="cubeItem">
          <button
            className="cube"
            onClick={() =>
              onSelect?.("favorites")
            }
            aria-label="Library"
            type="button"
          >
            <LibraryIcon
              size={28}
              className="cubeIconSvg"
            />
          </button>

          <span className="cubeLabelOutside">
            Library
          </span>
        </div>

        {/* DOWNLOADS */}
        <div className="cubeItem">
          <button
            className="cube"
            onClick={() =>
              onSelect?.("downloads")
            }
            aria-label="Downloads"
            type="button"
          >
            <DownloadIcon
              size={28}
              color="hsl(var(--text-muted))"
              strokeWidth={9}
              className="cubeIconSvg"
            />
          </button>

          <span className="cubeLabelOutside">
            Downloads
          </span>
        </div>

        {/* ALERTS */}
        <div className="cubeItem">
          <button
            className="cube"
            onClick={() =>
              onSelect?.("alerts")
            }
            aria-label="Alerts"
            type="button"
          >
            <BellIcon
              size={28}
              color="hsl(var(--text-muted))"
              className="cubeIconSvg"
            />
          </button>

          <span className="cubeLabelOutside">
            Alerts
          </span>
        </div>

        {/* MORE */}
        <div className="cubeItem">
          <button
            className="cube"
            onClick={() =>
              onSelect?.("more")
            }
            aria-label="More"
            type="button"
          >
            <GridMenuIcon
              size={28}
              color="hsl(var(--text-muted))"
              className="cubeIconSvg"
            />
          </button>

          <span className="cubeLabelOutside">
            More
          </span>
        </div>

      </div>
    </div>
  );
}
