"use client";
import { useBottomBar } from "@/stores/use-bottom-bar";
import { useFadersDrawer } from "@/stores/use-faders-drawer";
import { usePcFadersDrawer } from "@/stores/use-pc-faders-drawer";

export function useBottomBarActions() {
  const setFiltersOpen = useBottomBar((s) => s.setFiltersOpen);
  const openFaders = useFadersDrawer((s: any) => s.open);
  const openPcFaders = usePcFadersDrawer((s: any) => s.open);

  return {
    openFilters: () => {
      setFiltersOpen(true);
      openFaders(); // opens FadersDrawer
      openPcFaders(); // opens PC version
      // triggers your existing TopBar waOpen
      window.dispatchEvent(new CustomEvent("ug-open-search-panel"));
      console.log("FILTERS + SEARCH OPEN");
    },
    closeFilters: () => setFiltersOpen(false),
  };
}
