"use client";
import type { ReactNode } from "react";
import { useArsenalDrawer } from "./arsenal-drawer-store";

// arsenal-drawer-shell.tsx - SAME as UserDrawerShell. Header + body only. No stack, no overlay.
// Host renders one Shell per stack entry. Body feeds children into Shell.

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function ArsenalDrawerShell({ title, subtitle, children }: Props) {
  const back = useArsenalDrawer((s) => s.back);
  const depth = useArsenalDrawer((s) => s.stack.length);
  const isRoot = depth <= 1;

  return (
    <>
      <header className="arsenal-header">
        <button
          type="button"
          className="arsenal-back"
          onClick={back}
          aria-label={isRoot ? "Close" : "Back"}
        >
          {isRoot ? "\u2715" : "\u2039 Back"}
        </button>
        <h2 className="arsenal-title">{title}</h2>
        <span className="arsenal-header-spacer" />
      </header>
      {subtitle ? <p className="arsenal-subtitle">{subtitle}</p> : null}
      <div className="arsenal-body">{children}</div>
    </>
  );
}

