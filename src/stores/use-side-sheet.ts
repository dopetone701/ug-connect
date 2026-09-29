"use client";
import { create } from "zustand";

export type SheetId = "account" | "lists" | "subscription" | "tips" | "invite" | "privacy" | "cast" | "control" | null;

interface SideSheetState {
  active: SheetId;
  open: (id: SheetId) => void;
  close: () => void;
}

export const useSideSheet = create<SideSheetState>((set) => ({
  active: null,
  open: (id) => set({ active: id }),
  close: () => set({ active: null }),
}));
