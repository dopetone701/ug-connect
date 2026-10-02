"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import "../bottom-bar.css";
import "./movies-bottom-bar.css";
import { useBottomBarActions } from "../hooks/use-bottom-bar-actions";
import { useReelsDrawer } from "@/stores/use-reels-drawer";
import { useGlobalSearch } from "@/stores/use-global-search";
import { PreviewIcon } from "@/modal-generator/svg-icons/pre-play-icon";
import { ServicesIcon } from "@/modal-generator/svg-icons/pro-services-icon";
import { FilterIcon } from "@/modal-generator/svg-icons/fadders-icon";
import { YouIcon } from "@/modal-generator/svg-icons/profile-avatar";
import { useState, useEffect } from "react";

export default function MoviesBottomBar() {
  const path = usePathname();
  const { openFilters } = useBottomBarActions();
  const { openReels } = useReelsDrawer() as any;
  const { allMovies } = useGlobalSearch() as any;
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem("ug_user");
        setCurrentUser(raw? JSON.parse(raw) : null);
      } catch {
        setCurrentUser(null);
      }
    };
    loadUser();
    // listen for login/logout from anywhere
    window.addEventListener("storage", loadUser);
    window.addEventListener("ug-auth-changed", loadUser as EventListener);
    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("ug-auth-changed", loadUser as EventListener);
    };
  }, []);

  const openPreviewsReels = () => {
    const normalize = (x: any) => {
      const preview = x?.preview_urls?.[0] || x?.preview_url || x?.trailer_url || x?.video_preview_url || x?.preview;
      return {...x, id: String(x.id), preview_url: preview, preview_urls: x.preview_urls || (preview? [preview] : []), trailer_url: x.trailer_url || preview };
    };
    const list = (allMovies || []).map(normalize).filter((m: any) => m.preview_url || (m.preview_urls && m.preview_urls.length));
    const feed = list.length? list : (allMovies || []).map(normalize);
    if (feed.length) openReels(feed, 0);
  };

  const openAccountSheet = () => {
    window.dispatchEvent(new CustomEvent("ug-open-account-sheet"));
  };

  const avatarUrl = currentUser?.avatarUrl || currentUser?.avatar_url || currentUser?.avatar || currentUser?.photo || currentUser?.image;
  const isLoggedIn =!!currentUser &&!currentUser?.isGuest;

  return (
    <nav className="bottom-bar-glass movies-bar">
      <div className="bottom-inner">
        <Link href="/" className={`bottom-item ${path === "/"? "active" : ""}`}>
          <span className="bottom-icon"><ServicesIcon size={24} className="services-svg" /></span>
          <span className="bottom-label">Services</span>
        </Link>

        <button type="button" onClick={openFilters} className="bottom-item">
          <span className="bottom-icon"><FilterIcon size={24} className="filter-svg" /></span>
          <span className="bottom-label">Filters</span>
        </button>

        <Link href="/movies" className="bottom-item center active">
          <span className="bottom-icon center-icon">
            <Image src="/bottom-bar-images/movies.png" alt="Home" width={52} height={52} className="bottom-center-image" />
          </span>
        </Link>

        <button type="button" onClick={openPreviewsReels} className={`bottom-item ${path.includes("previews")? "active" : ""}`}>
          <span className="bottom-icon"><PreviewIcon size={24} className="preview-svg" /></span>
          <span className="bottom-label">Previews</span>
        </button>

        <button type="button" onClick={openAccountSheet} className={`bottom-item ${path === "/profile"? "active" : ""}`}>
          <span className="bottom-icon">
           {isLoggedIn && avatarUrl? (
  <img
    src={avatarUrl}
    alt={currentUser?.name || "You"}
    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid hsl(var(--border))' }}
  />
) : isLoggedIn? (
  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-text))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
    {(currentUser?.name?.[0] || currentUser?.email?.[0] || "U").toUpperCase()}
  </div>
) : (
  <YouIcon size={24} className="you-svg" />
)}
          </span>
          <span className="bottom-label">{isLoggedIn? (currentUser?.name?.split(" ")[0] || "You") : "You"}</span>
        </button>
      </div>
    </nav>
  );
}