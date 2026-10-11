"use client";
import { useEffect, useRef, useState } from "react";
import SettingsGearIcon from "./../../../../../modal-generator/svg-icons/settings-gear";
import { useVideoSettingsDrawer } from "@/stores/use-video-settings-drawer";
import BottomSheet from "./bottom-sheet";
import "./quality-glass.css";

const FALLBACK_OPTIONS = [
  { value: "auto", label: "Auto", hint: "Adaptive" },
  { value: "1080", label: "1080p", hint: "Full HD" },
  { value: "720", label: "720p", hint: "HD" },
  { value: "480", label: "480p", hint: "" },
  { value: "360", label: "360p", hint: "" },
];

export default function QualitySettings({ onQualityChange }: any) {
  const { isOpen, toggle, close, qualityOptions, selectedQuality, selectQuality } = useVideoSettingsDrawer();
  const [isDesktop, setIsDesktop] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth > 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isOpen || !isDesktop) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isDesktop, close]);

  // Always have options - use fallback if store empty, default to auto
  const options = qualityOptions && qualityOptions.length > 0 ? qualityOptions : FALLBACK_OPTIONS;
  const current = selectedQuality || "auto";

  // DESKTOP: YouTube-style glass dropdown
  if (isDesktop) {
    return (
      <div className="quality-desktop-wrap" ref={panelRef}>
        <button
          type="button"
          className="quality-settings-trigger"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px" }}
        >
          <SettingsGearIcon />
        </button>

        {isOpen && (
          <div className="quality-glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="quality-glass-header">
              <span>Quality • Auto</span>
              <button className="quality-glass-close" onClick={close}>✕</button>
            </div>
            <div className="quality-glass-list">
              {options.map((opt: any) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`quality-glass-item ${current === opt.value ? "active" : ""}`}
                  onClick={() => {
                    selectQuality(opt.value);
                    onQualityChange?.(opt.value);
                    close();
                  }}
                >
                  <div className="glass-item-left">
                    <div className="glass-dot">{current === opt.value ? "✓" : ""}</div>
                    <div className="glass-label">{opt.label}</div>
                  </div>
                  <div className="glass-hint">{opt.hint || (current === opt.value ? "Selected" : "")}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // MOBILE: 52vh Bottom Sheet - PRO
  return (
    <>
      <button
        type="button"
        className="quality-settings-trigger"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px" }}
      >
        <SettingsGearIcon />
      </button>

      <BottomSheet isOpen={isOpen} onClose={close}>
        <div className="cast-title">Quality</div>
        <div className="cast-subtitle">Auto • Adjusts to your connection</div>
        <div className="cast-list">
          {options.map((opt: any) => (
            <button
              key={opt.value}
              type="button"
              className={`cast-device ${current === opt.value ? "cast-device-primary" : ""}`}
              onClick={() => {
                selectQuality(opt.value);
                onQualityChange?.(opt.value);
                close();
              }}
            >
              <div className="cast-device-name">{opt.label}</div>
              <div className="cast-device-type">{current === opt.value ? "✓ Active" : opt.hint || ""}</div>
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}

