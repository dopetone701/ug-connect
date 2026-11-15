"use client";
import type { ReactNode } from "react";
import { useUserDrawer } from "../store/use-user-drawer";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function UserDrawerShell({ title, subtitle, children }: Props) {
  const back = useUserDrawer((s) => s.back);
  const depth = useUserDrawer((s) => s.stack.length);
  const isRoot = depth <= 1;

  return (
    <>
      <header className="ud-header">
        <button
          type="button"
          className="ud-back"
          onClick={back}
          aria-label={isRoot ? "Close" : "Back"}
        >
          {isRoot ? "\u2715" : "\u2039 Back"}
        </button>
        <h2 className="ud-title">{title}</h2>
        <span className="ud-header-spacer" />
      </header>
      {subtitle ? <p className="ud-subtitle">{subtitle}</p> : null}
      <div className="ud-body">{children}</div>
    </>
  );
}


