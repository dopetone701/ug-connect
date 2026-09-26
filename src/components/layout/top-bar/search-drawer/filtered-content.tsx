"use client";
import { useEffect, useMemo } from "react";
import { useGlobalSearch } from "../../../../stores/use-global-search";
import { useFadersDrawer } from "../../../../stores/use-faders-drawer";

export default function FilteredContent() {
  const { query, activeSection } = useGlobalSearch() as any;
  const { filterType, filterValue, timeRange } = useFadersDrawer() as any;

  const scope = useMemo(() => {
    const q = query?.trim();
    if (q) return q;

    // your new store: filterValue = "VJ Junior", "Action", "2010-2015", etc
    if (filterValue) return filterValue;
    if (activeSection) return activeSection;

    return "All";
  }, [query, activeSection, filterType, filterValue, timeRange]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = document.querySelector(".wa-filtered-title") as HTMLElement | null;
    if (!el) return;

    el.textContent = scope;
    el.title = scope;

    if (scope!== "All") {
      el.classList.add("is-filtered");
    } else {
      el.classList.remove("is-filtered");
    }
  }, [scope]);

  return null;
}
