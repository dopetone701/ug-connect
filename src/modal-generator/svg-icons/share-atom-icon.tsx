"use client";
import React from "react";

export default function ShareAtomIcon({ size = 20, color = "hsl(var(--text))" }: { size?: number; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', width: size, height: size, pointerEvents: 'none' }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
        <line x1="40.7" y1="41.2" x2="59.3" y2="30.8" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
        <line x1="40.7" y1="58.8" x2="59.3" y2="69.2" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
        {/* Negative space circles - transparent inside */}
        <circle cx="25" cy="50" r="18" fill="none" stroke={color} strokeWidth="5.5" />
        <circle cx="75" cy="22" r="18" fill="none" stroke={color} strokeWidth="5.5" />
        <circle cx="75" cy="78" r="18" fill="none" stroke={color} strokeWidth="5.5" />
      </svg>
    </span>
  );
}

