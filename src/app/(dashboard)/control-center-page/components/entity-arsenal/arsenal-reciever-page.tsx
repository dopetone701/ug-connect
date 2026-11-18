"use client";
// arsenal-reciever-page.tsx - RECEIVER PAGE. Full page, NOT a drawer, NOT Control Center.
// Top bar: OUR dynamic top bar - logo + "Upload to UG Connect" label. No links, no navigation anywhere.
// Gate (register) lives HERE - removed from Admin drawer.

import { useState } from "react";
import ArsenalRecieverBody from "./arsenal-reciever-body";
import "./arsenal-body.css";

export default function ArsenalRecieverPage() {
  return (
    <div style={{ minHeight: "100dvh", background: "hsl(var(--bg))", color: "hsl(var(--text))" }}>
      {/* DYNAMIC TOP BAR - logo only, NOT a link, NOT navigating */}
      <header className="ars-topbar">
        <div className="ars-topbar-logo">
          {/* Replace src with your real UG Connect logo */}
          <img src="/logo.png" alt="UG Connect" />
          <span>UG Connect</span>
        </div>
        <span className="ars-topbar-tag">Upload to UG Connect</span>
      </header>
      <div style={{ padding: "20px 20px calc(60px + env(safe-area-inset-bottom, 0px))", maxWidth: 640, margin: "0 auto" }}>
        <ArsenalRecieverBody />
      </div>
    </div>
  );
}

