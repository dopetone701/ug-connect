import { create } from "zustand";

export type VideoQuality = string;

type State = {
  isOpen: boolean;
  qualityOptions: { label: string; value: string; hint?: string }[];
  selectedQuality: string;
  open: () => void;
  close: () => void;
  toggle: () => void;
  selectQuality: (v: string) => void;
  setQualityOptions: (opts: any[]) => void;
  setSelectedQuality: (v: string) => void;
  setQualityHandler: (fn: any) => void;
  qualityHandler: any;
};

export const useVideoSettingsDrawer = create<State>((set) => ({
  isOpen: false,
  selectedQuality: "auto",
  qualityOptions: [],
  qualityHandler: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  selectQuality: (v) => set({ selectedQuality: v }),
  setQualityOptions: (opts) => set({ qualityOptions: opts }),
  setSelectedQuality: (v) => set({ selectedQuality: v }),
  setQualityHandler: (fn) => set({ qualityHandler: fn }),
}));
