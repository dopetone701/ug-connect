"use client";
import { create } from "zustand";

type State = {
  isOpen: boolean;
  selectedGenre: string | null;
  showFilterRow: boolean;
  open: () => void;
  close: () => void;
  selectGenre: (g: string | null) => void;
  setShowFilterRow: (v: boolean) => void;
};

export const useFadersDrawer = create<State>((set) => ({
  isOpen: false,
  selectedGenre: null,
  showFilterRow: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  selectGenre: (g) => set({ selectedGenre: g, showFilterRow: true, isOpen: false }),
  setShowFilterRow: (v) => set({ showFilterRow: v }),
}));
