"use client";
import { useEffect } from "react";
import { useUserDrawer } from "../store/use-user-drawer";
import { DRAWER_REGISTRY } from "./drawer-registry";
import "./user-drawer.css";

const LEAVE_MS = 300; // keep in sync with the exit animations in user-drawer.css

export default function UserDrawerHost() {
  const stack = useUserDrawer((s) => s.stack);
  const leaving = useUserDrawer((s) => s.leaving);
  const closingAll = useUserDrawer((s) => s.closingAll);
  const back = useUserDrawer((s) => s.back);
  const closeAll = useUserDrawer((s) => s.closeAll);
  const finishLeave = useUserDrawer((s) => s.finishLeave);

  // After the exit animation, actually remove the layer.
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(finishLeave, LEAVE_MS);
    return () => clearTimeout(t);
  }, [leaving, finishLeave]);

  const isOpen = stack.length > 0;

  // Escape = Back, and lock page scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") back();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, back]);

  // HIDE BOTTOM BAR while any drawer is open (same method as Title Matrix panel).
  // Drawer open -> hide bar. Fully closed -> bar comes back.
  useEffect(() => {
    if (!isOpen) return;
    const bar =
      (document.querySelector(".bottom-bar") as HTMLElement | null) ||
      (document.querySelector('nav[class*="bottom"]') as HTMLElement | null);
    if (!bar) return;
    const prevDisplay = bar.style.display;
    bar.style.display = "none";
    return () => {
      bar.style.display = prevDisplay;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`ud-overlay${closingAll ? " is-closing" : ""}`}
        onClick={closeAll}
      />
      {stack.map((entry, i) => {
        const Panel = DRAWER_REGISTRY[entry.id];
        const isTop = i === stack.length - 1;
        const cls = [
          "ud-sheet",
          i === 0 ? "is-base" : "is-next",
          isTop ? "" : "is-under",
          closingAll ? "is-closing" : leaving && isTop ? "is-leaving" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <section
            key={`${i}-${entry.id}`}
            className={cls}
            style={{ zIndex: 9999 + i }}
            aria-hidden={!isTop}
            role="dialog"
            aria-modal={isTop}
          >
            <Panel {...entry.props} />
          </section>
        );
      })}
    </>
  );
}
