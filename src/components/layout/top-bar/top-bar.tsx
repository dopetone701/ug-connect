"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import "./top-bar.css";
import "./top-bar-dynamics.css";
import SideBar from "../side-bar/side-bar";
import { useSideSheet } from "@/stores/use-side-sheet";
import AppLogo from "@/components/AppLogo";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import { useGlobalCast } from "@/stores/use-global-cast";
import { useFadersDrawer } from "../../../stores/use-faders-drawer";
import { usePcFadersDrawer } from "../../../stores/use-pc-faders-drawer";
import SearchDrawer from "./search-drawer/search-drawer";
import { useGlobalSearch } from "../../../stores/use-global-search";
import { SIDEBAR_ITEMS } from "../side-bar/config";
import AccountSheet from "../side-bar/sheets/account-sheet";
import ListsSheet from "../side-bar/sheets/lists-sheet";
import SubscriptionSheet from "../side-bar/sheets/subscription-sheet";
import TipsSheet from "../side-bar/sheets/tips-sheet";
import InviteSheet from "../side-bar/sheets/invite-sheet";
import PrivacySheet from "../side-bar/sheets/privacy-sheet";
import CastSheet from "../side-bar/sheets/cast-sheet";
import ControlSheet from "../side-bar/sheets/control-sheet";

const PLACES = [
  "Dubai",
  "Kampala",
  "London",
  "New York",
  "Nairobi",
  "Toronto",
  "Doha",
  "Johannesburg",
];

const PLACEHOLDER_MAP: any = {
  "/movies": "Search movies...",
  "/beds-near-u": "Search beds near you...",
  "/hair-cuts": "Search salons...",
  "/jobs": "Search jobs...",
  "/mobile-money": "Search mobile money...",
  "/ug-foods": "Search Ugandan foods...",
  "/send-to-uganda": "Search services...",
  "/chamber": "Search chamber...",
  "/dashboard": "Search dashboard...",
  "/search": "Search everything...",
};

// --- ADMIN CONFIG ---
export const ADMIN_EMAIL = "itsconnect89@gmail.com";

export const isAdminUser = (u: any) =>
  u?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [loc, setLoc] = useState("Dubai");
  const [locOpen, setLocOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"menu" | "search">("menu");
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [isDirectAccount, setIsDirectAccount] = useState(false);

  const [phase, setPhase] = useState<
    | "idle"
    | "card-dip"
    | "card-launch"
    | "card-enter"
    | "card-dip-back"
    | "card-launch-back"
    | "card-enter-back"
  >("idle");

  const {
    query: globalQuery,
    setQuery: setGlobalQuery,
    openSearch,
  } = useGlobalSearch();

  const isAllMoviesPage =
    pathname?.startsWith("/movies") ||
    pathname?.startsWith("/all-movies");

  const isReelsPage =
    pathname?.startsWith("/reels") ||
    pathname?.startsWith("/reel");

  const isServicesPage =
    pathname === "/" ||
    pathname === "/dashboard";

  const { setOpen } = useGlobalCast();
  const { close: closeSideSheet } = useSideSheet();

  const [user, setUser] = useState<any>(null);

  const placeholder = useMemo(() => {
    if (!pathname) return "Search...";

    for (const key in PLACEHOLDER_MAP) {
      if (pathname.includes(key)) {
        return PLACEHOLDER_MAP[key];
      }
    }

    return "Search...";
  }, [pathname]);

  const chips = useMemo(() => {
    if (!globalQuery?.trim()) return [];

    return globalQuery
      .trim()
      .toLowerCase()
      .split(" ")
      .filter((w: string) => w.length >= 1)
      .slice(0, 2)
      .map((label: string) => ({ label }));
  }, [globalQuery]);

  const isIslandActive = globalQuery?.length > 1;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncUser = () => {
      try {
        const saved = localStorage.getItem("ug_user");
        setUser(saved ? JSON.parse(saved) : null);
      } catch {
        setUser(null);
      }
    };

    syncUser();

    window.addEventListener("storage", syncUser);
    window.addEventListener("ug_auth_changed", syncUser as any);
    window.addEventListener("ug_profile_updated", syncUser as any);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("ug_auth_changed", syncUser as any);
      window.removeEventListener("ug_profile_updated", syncUser as any);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setLoc(localStorage.getItem("ug-loc") || "Dubai");
    setCollapsed(
      localStorage.getItem("ug-sidebar-collapsed") === "true"
    );
  }, []);

  useEffect(() => {
    if (waOpen) {
      document.body.classList.add("wa-pushed");
    } else {
      document.body.classList.remove("wa-pushed");
    }
  }, [waOpen]);

  useEffect(() => {
    setWaOpen(false);
    setActiveChild(null);
    setIsDirectAccount(false);
    setPhase("idle");
    document.body.classList.remove("wa-pushed");
  }, [pathname]);

  useEffect(() => {
    const handler = () => {
      setDrawerMode("search");
      setWaOpen(true);
    };

    window.addEventListener("ug-open-search-panel", handler);

    return () =>
      window.removeEventListener("ug-open-search-panel", handler);
  }, []);

  useEffect(() => {
    const openAccountHandler = () => {
      setDrawerMode("menu");
      setWaOpen(true);
      setIsDirectAccount(true);
      setActiveChild("account");
      setPhase("card-enter");
    };

    window.addEventListener(
      "ug-open-account-sheet",
      openAccountHandler as any
    );

    return () =>
      window.removeEventListener(
        "ug-open-account-sheet",
        openAccountHandler as any
      );
  }, []);

  useEffect(() => {
    const closeHandler = () => {
      setWaOpen(false);
      setActiveChild(null);
      setIsDirectAccount(false);
      setPhase("idle");
      closeSideSheet();
      document.body.classList.remove("wa-pushed");
    };

    window.addEventListener(
      "ug-close-menu-panel",
      closeHandler as any
    );

    return () =>
      window.removeEventListener(
        "ug-close-menu-panel",
        closeHandler as any
      );
  }, []);

  const filtered = PLACES
    .filter((p) =>
      p.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 2);

  const closeAll = () => {
    setWaOpen(false);
    setActiveChild(null);
    setIsDirectAccount(false);
    setPhase("idle");
    closeSideSheet();
  };

  const toggleSidebar = () => {
    const next = !collapsed;

    setCollapsed(next);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "ug-sidebar-collapsed",
        String(next)
      );

      document
        .querySelector(".side-bar")
        ?.classList.toggle("collapsed", next);

      window.dispatchEvent(
        new CustomEvent("ug-toggle-sidebar", {
          detail: next,
        })
      );
    }
  };

  const { open: openFaders } = useFadersDrawer() as any;
  const { open: watchOpen, minimized: watchMinimized } =
    useWatchDrawer() as any;
  const { open: openPcFaders } =
    usePcFadersDrawer() as any;

  if (isReelsPage) return null;

  if (watchOpen && !watchMinimized) return null;

  const handleOpenChild = (id: string) => {
    setIsDirectAccount(false);
    setPhase("card-dip");

    setTimeout(() => {
      setPhase("card-launch");
      setActiveChild(id);

      setTimeout(() => {
        setPhase("card-enter");
      }, 120);
    }, 130);
  };

  const handleBack = () => {
    if (isDirectAccount) {
      closeAll();
      return;
    }

    setPhase("card-dip-back");

    setTimeout(() => {
      setPhase("card-launch-back");

      setTimeout(() => {
        setPhase("card-enter-back");

        setTimeout(() => {
          setActiveChild(null);
          setPhase("idle");
        }, 400);
      }, 340);
    }, 110);
  };

  const renderChild = () => {
    switch (activeChild) {
      case "account":
        return <AccountSheet />;

      case "lists":
        return <ListsSheet />;

      case "subscription":
        return <SubscriptionSheet />;

      case "tips":
        return <TipsSheet />;

      case "invite":
        return <InviteSheet />;

      case "privacy":
        return <PrivacySheet />;

      case "cast":
        return <CastSheet />;

      case "control":
        return <ControlSheet />;

      default:
        return (
          <div
            style={{
              padding: "20px",
              opacity: 0.6,
            }}
          >
            Empty sheet for {activeChild}
          </div>
        );
    }
  };

  const getListCardClass = () => {
    if (isDirectAccount) return "is-hidden";

    if (phase === "card-dip") {
      return "is-dipping";
    }

    if (phase === "card-launch") {
      return "is-launching";
    }

    if (phase === "card-enter-back") {
      return "is-entering";
    }

    if (activeChild) {
      return "is-launching";
    }

    return "";
  };

  const getDetailCardClass = () => {
    if (drawerMode === "search") return "";

    if (isDirectAccount) {
      return "is-entering is-direct";
    }

    if (phase === "card-enter") {
      return "is-entering";
    }

    if (phase === "card-dip-back") {
      return "is-dipping";
    }

    if (phase === "card-launch-back") {
      return "is-launching";
    }

    if (!activeChild) return "";

    if (phase === "idle" && activeChild) {
      return "is-entering";
    }

    return "";
  };

  const getInitial = () => {
    if (!user) return "E";

    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }

    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "U";
  };

  const avatarUrl =
    user?.avatar?.url ||
    user?.avatarUrl ||
    user?.avatar ||
    user?.profilePicture ||
    user?.photo ||
    user?.image ||
    null;

  const isAdmin = isAdminUser(user);

  return (
    <>
      <header
        className={`top-bar ${
          isAllMoviesPage ? "all-movies-page" : ""
        } ${isAdmin ? "is-admin" : ""}`}
      >
        <div className="logo">
          <AppLogo className="logo-img" />
        </div>

        <div className="location-wrap pc-only">

          <button
            className="sidebar-v-toggle big pc-only"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: collapsed
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            className="loc-btn"
            onClick={() => setLocOpen((v) => !v)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>

            {loc}

            <span className="chev">▾</span>
          </button>

          {locOpen && (
            <div className="loc-dropdown">
              <input
                className="loc-search"
                placeholder="Search place..."
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                autoFocus
              />

              {filtered.map((p) => (
                <button
                  key={p}
                  className="loc-item"
                  onClick={() => {
                    setLoc(p);
                    setLocOpen(false);
                    setQuery("");

                    if (typeof window !== "undefined") {
                      localStorage.setItem("ug-loc", p);
                    }
                  }}
                >
                  {p}
                </button>
              ))}

              {filtered.length === 0 && (
                <div className="loc-empty">
                  No match
                </div>
              )}
            </div>
          )}
        </div>

        <div className="island-group pc-only">
          <div
            className={`search-wrap main-pill ${
              isIslandActive ? "is-split" : ""
            }`}
          >
            <svg
              className="svg-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="6" />
              <path d="M21 21l-4.3-4.3" />
            </svg>

            <input
              className="search"
              placeholder={placeholder}
              value={globalQuery}
              onChange={(e) => {
                const val = e.target.value;

                setGlobalQuery(val);

                if (val.trim().length >= 2) {
                  router.push(`/search?q=${val}`);
                }
              }}
              onFocus={() => openSearch()}
            />
          </div>

          <div
            className={`search-wrap split-pill ${
              isIslandActive ? "is-visible" : ""
            }`}
          >
            <div className="split-content">
              {chips.map((c: any, i: number) => (
                <span
                  key={i}
                  className="split-chip"
                >
                  {c.label}
                </span>
              ))}

              <button
                className="split-close"
                onClick={() => setGlobalQuery("")}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="right-actions">

          {/* =========================
              PC / DESKTOP CONTROLS
              ========================= */}
          <div className="pc-top-controls pc-only">

            {/* PC SLIDERS */}
            <button
              className="pc-faders-btn"
              aria-label="Filters and settings"
              type="button"
              onClick={() => openPcFaders()}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 7H20"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                />

                <circle
                  cx="9"
                  cy="7"
                  r="2.6"
                  fill="currentColor"
                />

                <path
                  d="M4 17H20"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                />

                <circle
                  cx="15"
                  cy="17"
                  r="2.6"
                  fill="currentColor"
                />
              </svg>
            </button>

            {/* PC GRID / VIEW */}
            <button
              className="pc-grid-btn"
              aria-label="Grid view"
              type="button"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("ug-toggle-grid")
                );
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="4"
                  y="4"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <rect
                  x="14"
                  y="4"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <rect
                  x="4"
                  y="14"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <rect
                  x="14"
                  y="14"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>

            {/* PC PROFILE */}
            {user && (
              <Link
                href="/profile"
                className="profile you-btn pc-profile-btn"
                aria-label="Profile"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <span>{getInitial()}</span>
                )}
              </Link>
            )}
          </div>

          {isServicesPage ? (
            // LANDING PAGE MOBILE:
            // only cast + profile (no search)
            <>
              <button
                className="tv-share-btn"
                aria-label="Cast"
                onClick={() => setOpen(true)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 18v3h3c0-1.66-1.34-3-3-3Z" />
                  <path d="M3 13v2c3.31 0 6 2.69 6 6h2c0-4.42-3.58-8-8-8Z" />
                  <path d="M3 8v2c5.52 0 10 4.48 10 10h2C15 13.37 9.63 8 3 8Z" />
                  <path d="M5 4h14c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-4v-2h4V6H5v3H3V6c0-1.1.9-2 2-2Z" />
                </svg>
              </button>

              {user && (
                <Link
                  href="/profile"
                  className="profile you-btn"
                  style={{
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <span>{getInitial()}</span>
                  )}
                </Link>
              )}
            </>
          ) : (
            // OTHER PAGES MOBILE:
            // 3 icons = menu + search + cast
            // NO profile in top bar
            <>
              <button
                className="tv-share-btn"
                aria-label="Cast"
                onClick={() => setOpen(true)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 18v3h3c0-1.66-1.34-3-3-3Z" />
                  <path d="M3 13v2c3.31 0 6 2.69 6 6h2c0-4.42-3.58-8-8-8Z" />
                  <path d="M3 8v2c5.52 0 10 4.48 10 10h2C15 13.37 9.63 8 3 8Z" />
                  <path d="M5 4h14c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-4v-2h4V6H5v3H3V6c0-1.1.9-2 2-2Z" />
                </svg>
              </button>

              <button
                className="mobile-search-icon"
                aria-label="Search"
                onClick={() => {
                  setDrawerMode("search");
                  setWaOpen(true);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="6" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </button>

              <button
                className="apple-burger"
                aria-label="menu"
                onClick={() => {
                  setDrawerMode("menu");
                  setWaOpen(true);
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="8"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <path
                    d="M4 16H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M4 20H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </header>

      {waOpen && (
        <div
          className={`wa-mob-panel ${
            drawerMode === "search"
              ? "is-search"
              : "is-menu"
          } ${
            isDirectAccount
              ? "is-direct-account"
              : ""
          }`}
        >
          <div className="wa-mob-top">
            <AppLogo className="wa-panel-logo" />

            {drawerMode === "search" && (
              <div className="wa-filtered-title">
                Filtered Content
              </div>
            )}

            {isDirectAccount && (
              <div className="wa-filtered-title">
                Account
              </div>
            )}

            <button
              className="wa-v"
              onClick={closeAll}
              aria-label="Close"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="wa-mob-body">
            {!isDirectAccount && (
              <div
                className={`wa-card list-card ${getListCardClass()}`}
              >
                {drawerMode === "menu" ? (
                  <div className="wa-scroll-wrap">
                    <SideBar
                      onOpen={handleOpenChild}
                    />
                  </div>
                ) : (
                  <div className="mobile-search-panel is-search-mode">
                    <div className="mobile-search-input-wrap sticky-search">
                      <svg
                        className="mobile-search-icon"
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle
                          cx="11"
                          cy="11"
                          r="6"
                        />

                        <path d="M21 21l-4.3-4.3" />
                      </svg>

                      <input
                        autoFocus
                        className="mobile-drawer-search"
                        placeholder={placeholder}
                        value={globalQuery}
                        onChange={(e) =>
                          setGlobalQuery(
                            e.target.value
                          )
                        }
                      />

                      <button
                        className="mobile-search-settings"
                        onClick={openFaders}
                        type="button"
                      >
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M4 7H20"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />

                          <circle
                            cx="10"
                            cy="7"
                            r="3"
                            fill="currentColor"
                          />

                          <path
                            d="M4 17H20"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />

                          <circle
                            cx="15"
                            cy="17"
                            r="3"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="wa-scroll-wrap search-results-scroll">
                      <div
                        style={{
                          marginTop: "16px",
                        }}
                      >
                        <SearchDrawer />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(activeChild || isDirectAccount) &&
              drawerMode === "menu" && (
                <div
                  className={`wa-card detail-card ${getDetailCardClass()}`}
                >
                  {!isDirectAccount && (
                    <div className="morph-header">
                      <button
                        className="morph-back"
                        onClick={handleBack}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <path d="M15 18l-6-6 6-6" />
                        </svg>

                        <span>
                          {SIDEBAR_ITEMS.find(
                            (x) =>
                              x.id === activeChild
                          )?.label ||
                            activeChild}
                        </span>
                      </button>
                    </div>
                  )}

                  <div className="morph-body">
                    {renderChild()}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </>
  );
}
