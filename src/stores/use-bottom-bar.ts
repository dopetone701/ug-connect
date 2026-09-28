import { create } from "zustand";

type BarType = "movies" | "universal" | "universal-hidden" | "jobs" | "food" | "mmoney";

interface BottomBarState {
  universalEnabled: boolean;
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  getBarType: (pathname: string) => BarType;
}

export const useBottomBar = create<BottomBarState>((set, get) => ({
  universalEnabled: false,
  filtersOpen: false,
  setFiltersOpen: (open) => set({ filtersOpen: open }),
 
  getBarType: (pathname: string) => {
    const { universalEnabled } = get();
    if (!universalEnabled) {
      if (pathname === "/" || pathname.startsWith("/services")) return "universal-hidden";
      return "movies";
    }
    if (pathname.startsWith("/movies")) return "movies";
    if (pathname.startsWith("/jobs")) return "jobs";
    if (pathname.startsWith("/ug-foods")) return "food";
    if (pathname.startsWith("/mobile-money")) return "mmoney";
    if (pathname === "/" || pathname === "/services") return "universal";
    return "movies";
  },
}));
