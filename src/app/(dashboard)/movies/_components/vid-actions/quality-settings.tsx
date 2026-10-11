
"use client";

import SettingsGearIcon from "./../../../../../modal-generator/svg-icons/settings-gear";
import { useVideoSettingsDrawer } from "@/stores/use-video-settings-drawer";
import "./setting-gear.css";

export type VideoQuality = "best" | "lower";

interface QualitySettingsProps {
  onQualityChange?: (quality: VideoQuality) => void;
}

export default function QualitySettings({
  onQualityChange,
}: QualitySettingsProps) {
  const isOpen = useVideoSettingsDrawer((state) => state.isOpen);
  const toggle = useVideoSettingsDrawer((state) => state.toggle);

  return (
    <div className="quality-settings">
      <button
        type="button"
        className="quality-settings-trigger"
        aria-label="Video quality settings"
        aria-expanded={isOpen}
        onClick={toggle}
      >
        <SettingsGearIcon />
      </button>
    </div>
  );
}

