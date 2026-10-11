
"use client";

import { create } from "zustand";

type VideoSettingsDrawerState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const useVideoSettingsDrawer =
  create<VideoSettingsDrawerState>((set) => ({
    isOpen: false,

    open: () => set({ isOpen: true }),

    close: () => set({ isOpen: false }),

    toggle: () =>
      set((state) => ({
        isOpen: !state.isOpen,
      })),
  }));

