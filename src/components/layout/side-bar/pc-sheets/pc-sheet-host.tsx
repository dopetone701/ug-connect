"use client";
import { useState, useEffect } from "react";
import { useSideSheet } from "@/stores/use-side-sheet";
import PcSheetContent from "./pc-sheet-content";
import "./pc-sheet.css";

export default function PcSheetHost() {
  const { active } = useSideSheet();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isDesktop) return null;
  if (!active) return <div className="pc-inline-sheet pc-empty" />;

  return (
    <div className="pc-inline-sheet pc-animate-in">
      {/* No header/back on PC - sidebar shows selection */}
      <div className="pc-inline-body" key={active}>
        <PcSheetContent id={active} />
      </div>
    </div>
  );
}

