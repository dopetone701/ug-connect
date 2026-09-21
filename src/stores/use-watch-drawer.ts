"use client";
import { create } from "zustand";

type Store = {
  open: boolean;
  movieId: string | null;
  openDrawer: (id: string) => void;
  closeDrawer: () => void;
};

export const useWatchDrawer = create<Store>((set) => ({
  open: false,
  movieId: null,
  openDrawer: (id) => set({ open: true, movieId: id }),
  closeDrawer: () => {
    set({ open: false });
    setTimeout(() => set({ movieId: null }), 400); // wait slide-down, then kill DOM = no blur
  },
}));
