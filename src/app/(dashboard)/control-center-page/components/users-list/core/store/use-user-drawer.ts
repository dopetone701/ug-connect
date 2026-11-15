"use client";
import { create } from "zustand";
import type {
  DrawerEntry,
  DrawerId,
  DrawerProps,
} from "../drawers/drawer.types";

type UserDrawerState = {
  stack: DrawerEntry[];
  leaving: boolean; // top layer is playing its exit animation
  closingAll: boolean; // exit animation is closing everything
  open: (id: DrawerId, props: DrawerProps) => void;
  back: () => void;
  closeAll: () => void;
  finishLeave: () => void; // called by the host when the exit animation ends
};

export const useUserDrawer = create<UserDrawerState>((set, get) => ({
  stack: [],
  leaving: false,
  closingAll: false,

  open: (id, props) => {
    const { stack, leaving } = get();
    if (leaving) return;
    const top = stack[stack.length - 1];
    if (
      top &&
      top.id === id &&
      top.props.userId === props.userId &&
      top.props.action === props.action
    ) {
      return; // double tap guard
    }
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
    set({
      stack: closingAll ? [] : stack.slice(0, -1),
      leaving: false,
      closingAll: false,
    });
  },
}));

