"use client";
import { useFadersDrawer } from "../../../../stores/use-faders-drawer";
import "./faders-drawer.css"; // <-- mobile styles ONLY here
import FadersCloseBtn from "./faders-close-btn";
import FilteredContent from "../search-drawer/filtered-content";
import FadersTiles from "./faders-tiles";

export default function FadersDrawer() {
  const { isOpen, close, select, selectTime, filterType, filterValue } = useFadersDrawer() as any;
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
