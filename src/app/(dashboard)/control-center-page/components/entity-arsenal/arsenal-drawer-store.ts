"use client";
import { create } from "zustand";

// arsenal-drawer-store.ts - SAME pattern as useUserDrawer. Controls only.

export type ArsenalDrawerId = "arsenal-list" | "arsenal-picker" | "share-arsenal"; // NO reciever-register here - gate lives on Receiver page only
export type ArsenalDrawerProps = { email?: string; itemId?: string; [key: string]: any };
export type ArsenalDrawerEntry = { id: ArsenalDrawerId; props: ArsenalDrawerProps };

export type ArsenalMode = "admin" | "reciever";

type ArsenalDrawerState = {
  mode: ArsenalMode;
  setMode: (m: ArsenalMode) => void;
  stack: ArsenalDrawerEntry[];
  leaving: boolean;
  closingAll: boolean;
  open: (id: ArsenalDrawerId, props?: ArsenalDrawerProps) => void;
  back: () => void;
  closeAll: () => void;
  finishLeave: () => void;
};

export const useArsenalDrawer = create<ArsenalDrawerState>((set, get) => ({
  mode: "admin",
  setMode: (m) => set({ mode: m }),
  stack: [],
  leaving: false,
  closingAll: false,

  open: (id, props = {}) => {
    const { stack, leaving } = get();
    if (leaving) return;
    const top = stack[stack.length - 1];
    if (top && top.id === id && top.props.email === props.email && top.props.itemId === props.itemId) return;
    set({ stack: [...stack, { id, props }] });
  },
  back: () => {
    const { stack, leaving } = get();
    if (!stack.length || leaving) return;
    set({ leaving: true, closingAll: stack.length === 1 });
  },
  closeAll: () => {
    const { stack, leaving } = get();
    if (!stack.length || leaving) return;
    set({ leaving: true, closingAll: true });
  },
  finishLeave: () => {
    const { stack, leaving, closingAll } = get();
    if (!leaving) return;
    set({ stack: closingAll ? [] : stack.slice(0, -1), leaving: false, closingAll: false });
  },
}));

