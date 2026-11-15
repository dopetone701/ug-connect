"use client";
import type { ComponentType } from "react";
import type { DrawerProps } from "./drawer.types";
import UserDrawerShell from "./user-drawer-shell";
import { useUserDrawer } from "../store/use-user-drawer";

// Temporary stand-in for panels that are not built yet.
// Delete this file once every drawer in the registry is real.
export function createPlaceholder(
  title: string,
  description: string
): ComponentType<DrawerProps> {
  function PlaceholderDrawer({ userId }: DrawerProps) {
    const open = useUserDrawer((s) => s.open);
    return (
      <UserDrawerShell title={title}>
        <div className="ud-card">{description}</div>
        <div className="ud-actions">
          <button
            type="button"
            className="ud-btn is-ghost"
            onClick={() => open("confirm", { userId, action: "terminate" })}
          >
            Test: open a deeper drawer
          </button>
        </div>
      </UserDrawerShell>
    );
  }
  PlaceholderDrawer.displayName = `Placeholder(${title})`;
  return PlaceholderDrawer;
}


