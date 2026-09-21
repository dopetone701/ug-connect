"use client";
import { create } from "zustand";
type Store = {
  open: boolean;
  minimized: boolean;
  movieId: string | null;
  playType: "full" | "preview";
  openDrawer: (id: string, type?: "full" | "preview") => void;
  closeDrawer: () => void;
  minimize: () => void;
  maximize: () => void;
};
export const useWatchDrawer = create<Store>((set) => ({
  open: false,
  minimized: false,
  movieId: null,
  playType: "full",
  openDrawer: (id, type="full") => set({ open:true, minimized:false, movieId:id, playType:type }),
  closeDrawer: () => { set({ open:false, minimized:false }); setTimeout(()=>set({movieId:null}),400); },
  minimize: () => set({ minimized:true, open:true }), // KEEP OPEN TRUE = smooth morph
  maximize: () => set({ minimized:false, open:true }),
}));
