"use client";
import { create } from "zustand";

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

export const useFadersDrawer = create<State>((set) => ({
  isOpen: false,
  filterType: null,
  filterValue: null,
  timeRange: null,
  showFilterRow: false,
  selectedGenre: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  select: (type, value) => set({
    filterType: type,
    filterValue: value,
    timeRange: null,
    selectedGenre: type === "genre" ? value : null,
    showFilterRow: true,
    isOpen: false
  }),

  selectTime: (start, end) => {
    const label = end === 9999 ? `${start}-Present` : `${start}-${end}`;
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

  selectGenre: (g) => set({
    selectedGenre: g,
    filterType: g ? "genre" : null,
    filterValue: g,
    timeRange: null,
    showFilterRow: !!g,
    isOpen: false
  }),
  clearFilters: () => set({
    filterType: null,
    filterValue: null,
    timeRange: null,
    showFilterRow: false,
    selectedGenre: null
  }),
}));

