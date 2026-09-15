"use client";
import "./dots-menu.css";
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";

type MenuItem = { label: string; value: string; danger?: boolean };

const MENU_ITEMS: MenuItem[] = [
  { label: "Download", value: "download" },
  { label: "Add to my list", value: "list" },
  { label: "Share", value: "share" },
  { label: "Report a problem", value: "report", danger: true },
];

type Props = {
  itemData?: unknown;
  items?: MenuItem[];
  onAction?: (type: string, data?: unknown) => void;
};

export default function DotsMenu({ itemData, items = MENU_ITEMS, onAction }: Props){
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, up: false });
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(()=> setIsOpen(false), []);
  const toggleMenu = useCallback(()=> setIsOpen((v)=>!v), []);

  const updatePos = useCallback(()=>{
    if(!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const h = panelRef.current?.offsetHeight || 176;
    const w = 176;
    const spaceBelow = window.innerHeight - rect.bottom;
    const up = spaceBelow < h + 16;
    const top = up? rect.top - h - 8 : rect.bottom + 8;
    const left = Math.max(8, Math.min(window.innerWidth - w - 8, rect.right - w));
    setCoords({ top, left, up });
  },[]);

  useLayoutEffect(()=>{
    if(!isOpen) return;
    updatePos();
    const onScroll = ()=> requestAnimationFrame(updatePos);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", updatePos);
    return ()=>{
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", updatePos);
    };
  },[isOpen, updatePos]);

  useEffect(()=>{
    const onDocClick = (e: MouseEvent)=>{
      if(!wrapRef.current?.contains(e.target as Node)) closeMenu();
    };
    document.addEventListener("click", onDocClick);
    return ()=> document.removeEventListener("click", onDocClick);
  },[closeMenu]);

  const onKey = (e: React.KeyboardEvent, fn: () => void)=>{
    if(e.key === "Enter" || e.key === " "){
      e.preventDefault();
      fn();
    }
  };

  const handleItemClick = (type: string)=>{
    closeMenu();
    if(onAction){
      onAction(type, itemData);
      return;
    }
    if(type === "share" && typeof navigator!== "undefined" && "share" in navigator){
      (navigator as any).share({ title: document.title, url: window.location.href }).catch(()=>{});
    }
  };

  return (
    <div ref={wrapRef} className="dots-menu-wrap" onClick={(e)=> e.stopPropagation()}>
      <div
        ref={btnRef}
        className={`dots-menu-btn ${isOpen? "open" : ""}`}
        role="button"
        tabIndex={0}
        aria-label="more options"
        onClick={toggleMenu}
        onKeyDown={(e)=> onKey(e, toggleMenu)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </div>

      {isOpen && (
        <div
          ref={panelRef}
          className={`dots-menu-panel ${coords.up? "up" : "down"}`}
          style={{ position: "fixed", top: coords.top, left: coords.left }}
        >
          {items.map((it)=>(
            <div
              key={it.value}
              className={`dots-menu-item ${it.danger? "danger" : ""}`}
              role="button"
              tabIndex={0}
              onClick={()=> handleItemClick(it.value)}
              onKeyDown={(e)=> onKey(e, ()=> handleItemClick(it.value))}
            >
              {it.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
