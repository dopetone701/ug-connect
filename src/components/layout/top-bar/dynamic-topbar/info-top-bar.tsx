"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./info-top-bar.css";
import { useFooterSheet } from "@/stores/use-footer-sheet";

type Props = {
  title?: string;
  onBack?: () => void;
};

export default function InfoTopBar({ title: propTitle, onBack }: Props) {
  const router = useRouter();
  const [eventTitle, setEventTitle] = useState("");
  const { stack, pop, isOpen } = useFooterSheet() as any;

  useEffect(() => {
    const handler = (e: any) => setEventTitle(e.detail || "");
    window.addEventListener("ug-info-title", handler);
    return () => window.removeEventListener("ug-info-title", handler);
  }, []);

  const displayTitle = propTitle || eventTitle;

  const handleBack = () => {
    // If sheets are open, close sheet instead of closing info page
    if (isOpen || stack?.length > 0) {
      pop();
      return;
    }

    if (onBack) {
      onBack();
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <header className="info-top-bar">
      <button className="info-back-btn" onClick={handleBack} aria-label="Back">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      {displayTitle && <h1 className="info-top-title">{displayTitle}</h1>}
      <div className="info-top-spacer" />
    </header>
  );
}

