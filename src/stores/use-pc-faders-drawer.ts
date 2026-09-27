import { create } from "zustand";
export const usePcFadersDrawer = create((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
