
"use client";

import { create } from "zustand";

export type VideoQualityOption = {
  label: string;
  value: string;
};

type VideoSettingsDrawerState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;

  qualityOptions: VideoQualityOption[];
  selectedQuality: string;
  selectQuality: ((value: string) => void) | null;

  setQualityOptions: (options: VideoQualityOption[]) => void;
  setSelectedQuality: (value: string) => void;
  setQualityHandler: (
    handler: ((value: string) => void) | null
  ) => void;
};

export const useVideoSettingsDrawer =
  create<VideoSettingsDrawerState>((set) => ({
    isOpen: false,

    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () =>
      set((state) => ({ isOpen: !state.isOpen })),

    qualityOptions: [],
    selectedQuality: "auto",
    selectQuality: null,

    setQualityOptions: (qualityOptions) =>
      set({ qualityOptions }),

    setSelectedQuality: (selectedQuality) =>
      set({ selectedQuality }),

    setQualityHandler: (selectQuality) =>
      set({ selectQuality }),
  }));

