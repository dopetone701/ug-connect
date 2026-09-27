"use client";
import { usePcFadersDrawer } from "@/stores/use-pc-faders-drawer";
import { useGlobalSearch } from "@/stores/use-global-search";
import FadersTiles from "./faders-tiles";
import "./pc-faders.css";

export default function PcFaders() {
  const { close, filterType, filterValue } = usePcFadersDrawer() as any;
  const { setQuery, setSection, openSearch } = useGlobalSearch();

  // This is the ONLY logic you need - same as mobile
  const handleSelect = (type: string, value: string) => {
    // close PC panel first
    close();

    // feed your existing search store - no new filter system
    const clean = value.toLowerCase().trim();

    if (type === "genre" || type === "vj") {
      // Try section first - getSections will find "Action Movies" from "action"
      setSection(clean);
      setQuery(clean);
    } else {
      // actor / time - use query search
      setSection(null);
      setQuery(clean);
    }

    openSearch(); // opens search-drawer with VirtualGrid
  };

  const handleSelectTime = (period: string, value: string) => {
    close();
    setSection(null);
    setQuery(value); // your filtered() handles year logic 2005 etc
    openSearch();
  };

  const handleSeeAll = (type: "genre" | "vj" | "actor" | "time") => {
    close();
    setQuery("");
    setSection(type);
    openSearch();
  };

  return (
    <div className="pc-faders-page">
      <div className="pc-faders-page-header">
        <h2>Filters</h2>
        <button onClick={close} className="pc-faders-page-close">✕ Close</button>
      </div>
      <div className="pc-faders-page-content">
        <FadersTiles
          select={handleSelect}
          selectTime={handleSelectTime}
          filterType={filterType}
          filterValue={filterValue}
          onSeeAll={handleSeeAll}
        />
      </div>
    </div>
  );
}
