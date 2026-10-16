"use client";
import { create } from "zustand";
import { useGlobalSearch } from "./use-global-search";

type FilterType = "genre" | "vj" | "actor" | "time" | null;

type State = {
  isOpen: boolean;
  filterType: FilterType;
  filterValue: string | null;
  timeRange: { start: number; end: number } | null;
  showFilterRow: boolean;
  selectedGenre: string | null;
  open: () => void;
  close: () => void;
  select: (type: FilterType, value: string) => void;
  selectTime: (start: number, end: number) => void;
  clear: () => void;
  selectGenre: (g: string | null) => void;
  clearFilters: () => void;
};

const triggerSearchOpen = (value: string, section?: string | null) => {
  try {
    const gs = (useGlobalSearch as any).getState?.();
    if (!gs) return;
    if (value) {
      gs.setQuery(value);
    }
    if (section !== undefined) {
      gs.setSection(section);
    }
    gs.openSearch?.();
    gs.setOpen?.(true);
    gs.setIsOpen?.(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ug-open-search-panel"));
    }
  } catch {}
};

export const useFadersDrawer = create<State>((set) => ({
  isOpen: false,
  filterType: null,
  filterValue: null,
  timeRange: null,
  showFilterRow: false,
  selectedGenre: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  select: (type, value) => {
    if (value) {
      // INSTANT OPEN: genre/vj/actor/user-list/watch-history etc
      triggerSearchOpen(value, type === "genre" ? value : null);
    }
    return set({
      filterType: type,
      filterValue: value,
      timeRange: null,
      selectedGenre: type === "genre" ? value : null,
      showFilterRow: true,
      isOpen: false
    });
  },

  selectTime: (start, end) => {
    const label = end === 9999 ? `${start}-Present` : `${start}-${end}`;
    triggerSearchOpen(label, null);
    return set({
      filterType: "time",
      filterValue: label,
      timeRange: { start, end },
      selectedGenre: null,
      showFilterRow: true,
      isOpen: false
    });
  },

  clear: () => set({
    filterType: null,
    filterValue: null,
    timeRange: null,
    showFilterRow: false,
    selectedGenre: null
  }),

  selectGenre: (g) => {
    if (g) triggerSearchOpen(g, g);
    return set({
      selectedGenre: g,
      filterType: g ? "genre" : null,
      filterValue: g,
      timeRange: null,
      showFilterRow: !!g,
      isOpen: false
    });
  },

  clearFilters: () => {
    try {
      const gs = (useGlobalSearch as any).getState?.();
      gs?.setQuery?.("");
      gs?.setSection?.(null);
      gs?.closeSearch?.();
    } catch {}
    return set({
      filterType: null,
      filterValue: null,
      timeRange: null,
      showFilterRow: false,
      selectedGenre: null
    });
  },
}));
