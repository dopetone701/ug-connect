"use client";
import { useEffect } from "react";
import { useFadersDrawer } from "../../../../stores/use-faders-drawer";
import "./faders-drawer.css";
import FadersCloseBtn from "./faders-close-btn";
import FilteredContent from "../search-drawer/filtered-content";
import FadersTiles from "./faders-tiles";

export default function FadersDrawer() {
  const { isOpen, close, select, selectTime, filterType, filterValue } = useFadersDrawer() as any;

  // FORCE HIDE search bar when faders open - works everywhere, no :has needed
  useEffect(() => {
    const searchBar = document.querySelector(".mobile-search-input-wrap.sticky-search") as HTMLElement;
    const searchPanel = document.querySelector(".wa-mob-panel.is-search") as HTMLElement;
    if (isOpen) {
      if (searchBar) {
        searchBar.style.display = "none";
        searchBar.style.opacity = "0";
        searchBar.style.pointerEvents = "none";
      }
      if (searchPanel) searchPanel.classList.add("faders-open");
    } else {
      if (searchBar) {
        searchBar.style.display = "";
        searchBar.style.opacity = "";
        searchBar.style.pointerEvents = "";
      }
      if (searchPanel) searchPanel.classList.remove("faders-open");
    }
  }, [isOpen]);

  return (
    <div className={`faders-drawer-root mob-only ${isOpen? "open" : ""}`}>
      <div className="faders-backdrop" onClick={close} />
      <div className="faders-sheet">
        <div className="faders-handle" />
        <div className="faders-scroll">
          <FadersTiles select={select} selectTime={selectTime} filterType={filterType} filterValue={filterValue} onSeeAll={close} />
        </div>
      </div>
      <FadersCloseBtn />
      <FilteredContent />
    </div>
  );
}
