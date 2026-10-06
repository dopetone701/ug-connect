"use client";
import FavoritesSheet from "../../../../app/auth-system/account-sheets/favorites-sheet";

export default function ListsSheet(){
  return (
    <>
      <style jsx global>{`
        .vault-root {
          width: 100% !important;
          max-width: 100% !important;
          min-height: 100% !important;
          height: auto !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 20px !important;
          padding: 16px 16px 120px 16px !important;
          margin: 0 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        .vault-row-block {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          flex-shrink: 0 !important;
        }
        .vault-empty {
          padding: 24px;
          opacity: 0.7;
        }
        /* make parent sheet scrollable too - same fix as subs */
        [data-side-sheet], .sheet-shell, .side-sheet-content {
          overflow-y: auto !important;
          height: 100% !important;
        }
      `}</style>
      <div style={{ height: "100dvh", overflowY: "auto", overflowX: "hidden" }}>
        <FavoritesSheet />
      </div>
    </>
  );
}