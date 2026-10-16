"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalSearch } from "@/stores/use-global-search";
import FavoritesSheet from "../../../../app/auth-system/account-sheets/favorites-sheet";

function isMobile() {
  if (typeof window === "undefined") return true;
  return window.innerWidth < 1024;
}

export default function ListsSheet(){
  const router = useRouter();

  useEffect(() => {
    // 1. SEE ALL -> close account sheets instantly + open filter drawer
    const forceOpenFilter = (e: any) => {
      const q = (e.detail?.query || e.detail?.id || "").toLowerCase() ||
                (useGlobalSearch.getState().query || "").toLowerCase();
     
      if (!q.includes("my list") && !q.includes("watch") && !q.includes("continue") && !q.includes("liked") && !q.includes("history")) return;

      // CLOSE sheets instantly - but DON'T set pointerEvents none on account-sheet
      document.documentElement.classList.remove("is-sheet-open");
      document.body.style.overflow = "";
      
      window.dispatchEvent(new CustomEvent("ug-close-menu-panel"));
      window.dispatchEvent(new CustomEvent("ug-close-account-sheet"));
      window.dispatchEvent(new CustomEvent("ug-close-sheet"));
      window.dispatchEvent(new CustomEvent("ug-close-fav-empty"));
       
      try { (require("@/stores/use-side-sheet") as any).useSideSheet.getState().open(null); } catch {}

      // OPEN filter drawer
      const gs = useGlobalSearch.getState() as any;
      setTimeout(() => {
        gs.openSearch?.();
        gs.setOpen?.(true);
        gs.setIsOpen?.(true);
         
        if (isMobile()) {
          window.dispatchEvent(new CustomEvent("ug-open-search-panel"));
        } else {
          const param = encodeURIComponent(q || "my list");
          router.push(`/search?q=${param}&filter=${param}&section=${param}`);
        }
      }, 20);
    };

    // 2. FIX: Account opening should work even if search has "my list" text
    // Close search drawer visually, but KEEP query text
    const onAccountOpen = () => {
      const gs = useGlobalSearch.getState() as any;
      // Keep query - don't clear my list text
      // Just close drawer visuals
      gs.setOpen?.(false);
      gs.setIsOpen?.(false);
      document.querySelector(".search-drawer-root")?.classList.remove("open");
      document.documentElement.classList.remove("is-search-open");
      // Don't clear gs.query - user wants to keep my list text
    };

    window.addEventListener("ug-open-search-panel" as any, forceOpenFilter);
    window.addEventListener("ug-open-account-sheet" as any, onAccountOpen);

    // SEE ALL click delegation - only for SEE ALL buttons
    const clickHandler = (e: any) => {
      const target = e.target as HTMLElement;
      if (target.closest(".latest-see")) {
        setTimeout(() => {
          forceOpenFilter({ detail: { query: useGlobalSearch.getState().query } });
        }, 10);
      }
    };
    document.addEventListener("click", clickHandler as any, true);

    return () => {
      window.removeEventListener("ug-open-search-panel" as any, forceOpenFilter);
      window.removeEventListener("ug-open-account-sheet" as any, onAccountOpen);
      document.removeEventListener("click", clickHandler as any, true);
    };
  }, [router]);

  return (
    <>
      <style jsx global>{`
        .vault-root {
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          min-height: fit-content !important;
          max-height: calc(100dvh - 180px) !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 20px !important;
          padding: 16px !important;
          margin: 0 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          flex: 0 1 auto !important;
        }
        .vault-row-block {
          width: 100% !important;
          height: auto !important;
          flex: 0 0 auto !important;
        }
        [data-side-sheet], .sheet-shell, .side-sheet-content {
          height: auto !important;
          max-height: 100dvh !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
        }
        /* Make SEE ALL clickable, but DON'T block account sheet */
        .vault-root .latest-see {
          pointer-events: auto !important;
          z-index: 10 !important;
          cursor: pointer !important;
        }
      `}</style>
      <div style={{ height: "auto", maxHeight: "100%", overflow: "visible" }}>
        <FavoritesSheet />
      </div>
    </>
  );
}
