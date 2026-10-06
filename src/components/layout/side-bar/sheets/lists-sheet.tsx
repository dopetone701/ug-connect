"use client";
import FavoritesSheet from "../../../../app/auth-system/account-sheets/favorites-sheet";

export default function ListsSheet(){
  return (
    <>
      <style jsx global>{`
        /* CONTAINER ONLY - auto height */
        .vault-root {
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          min-height: fit-content !important;
          max-height: calc(100dvh - 180px) !important; /* leaves space for header + nav */
          display: flex !important;
          flex-direction: column !important;
          gap: 20px !important;
          padding: 16px !important;
          margin: 0 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          flex: 0 1 auto !important; /* don't expand */
        }
        .vault-row-block {
          width: 100% !important;
          height: auto !important;
          flex: 0 0 auto !important;
        }
        /* parent sheet should NOT force 100% */
        [data-side-sheet], .sheet-shell, .side-sheet-content {
          height: auto !important;
          max-height: 100dvh !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
        }
      `}</style>
      <div style={{ height: "auto", maxHeight: "100%", overflow: "visible" }}>
        <FavoritesSheet />
      </div>
    </>
  );
}