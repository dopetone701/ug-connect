"use client";
import { useState, useRef } from "react";
import UserAccountPage from "@/app/auth-system/user-account-page";
import { SHEET_REGISTRY, SHEET_ORDER, type SheetId } from "@/app/auth-system/account-sheets";

export default function AccountSheet(){
  // FIX RED LINE - use first item from SHEET_ORDER, not hardcoded string
  const [active, setActive] = useState<SheetId>(SHEET_ORDER[0] as SheetId);
  const idx = SHEET_ORDER.indexOf(active);
  const startX = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(diff) > 60) {
      if (diff < 0 && idx < SHEET_ORDER.length - 1) {
        setActive(SHEET_ORDER[idx + 1]);
      } else if (diff > 0 && idx > 0) {
        setActive(SHEET_ORDER[idx - 1]);
      }
    }
  };

  return (
    <div
      data-account-sheet
      className="account-slice-root"
      style={{
        width:'100%',
        display:'flex',
        flexDirection:'column',
        gap:'16px',
        marginTop:'12px', // <-- LIL GAP between Account header and top card
        paddingTop:'4px'
      }}
    >

      {/* UPPER - FIXED - FULL WIDTH */}
      <div style={{ width:'100%', borderRadius:'24px', background:'hsl(var(--surface))', border:'1px solid hsl(var(--border))' }}>
        <UserAccountPage onSelect={setActive} />
      </div>

      {/* LOWER VIEWPORT */}
      <div
        className="lower-viewport"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ width:'100%', overflow:'hidden' }}
      >
        <div
          className="lower-track"
          style={{
            display:'flex',
            width:'100%',
            transform:`translateX(-${idx * 100}%)`,
            transition:'transform 0.4s cubic-bezier(0.16,1,0.3,1)'
          }}
        >
          {SHEET_ORDER.map((id) => {
            const Comp = SHEET_REGISTRY[id].component;
            return (
              <div key={id} style={{ minWidth:'100%', width:'100%', flexShrink:0, padding:'0 1px', boxSizing:'border-box' }}>
                <div style={{ width:'100%', borderRadius:'24px', background:'hsl(var(--surface))', border:'1px solid hsl(var(--border))', minHeight:'320px', padding:'16px' }}>
                  <Comp />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DOTS */}
      <div style={{ display:'flex', justifyContent:'center', gap:'6px', marginTop:'-4px' }}>
        {SHEET_ORDER.map((id) => (
          <span
            key={id}
            style={{
              width: active===id? '18px':'6px',
              height:'6px',
              borderRadius:'999px',
              background: active===id? 'hsl(var(--text))':'hsl(var(--border))',
              transition:'all 0.25s ease',
              display:'block'
            }}
          />
        ))}
      </div>

    </div>
  )
}
