"use client";

import "./the-hall-shell.css";
import FaqRoom from "./faq-room/faq";

export default function TheHallShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="hall-shell-root">
      <div className="hall-shape-wrap">
        <div className="hall-inside">
          {children}
          <FaqRoom />
        </div>
      </div>
    </div>
  );
}
