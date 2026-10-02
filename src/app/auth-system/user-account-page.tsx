"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { useMovieStore } from "@/stores/use-movie-store";
import { useGlobalSearch } from "@/stores/use-global-search";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import { useReelsDrawer } from "@/stores/use-reels-drawer";

import "./user-account-page.css";

type User = {
  name?: string;
  email?: string;
  avatarUrl?: string;
  avatar_url?: string;
  avatar?: string;
};

export default function UserAccountPage() {
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  const {
    lists,
    favIds,
    recentIds,
    _hydrate,
    hydrated,
  } = useMovieStore() as any;

  const { allMovies = [] } = useGlobalSearch() as any;

  useEffect(() => {
    const raw = localStorage.getItem("ug_user");

    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        // Ignore invalid stored user data
      }
    }

    if (!hydrated) {
      _hydrate?.();
    }
  }, [hydrated, _hydrate]);

  const name = user?.name || "Tcide";

  const email =
    user?.email || "last seen 24/09/26";

  const initial =
    (name?.[0] || "T").toUpperCase();

  const avatar =
    user?.avatarUrl ||
    user?.avatar_url ||
    user?.avatar;

  /*
   * MAIN LIST
   */
  const mainList = lists?.[0];

  /*
   * MY LIST MOVIES
   */
  const myMovies = (allMovies || []).filter(
    (m: any) =>
      mainList?.movieIds?.includes(String(m.id)) ||
      mainList?.movieIds?.includes(m.id)
  );

  /*
   * LIKED MOVIES
   */
  const favMovies = (allMovies || []).filter(
    (m: any) =>
      favIds?.includes(String(m.id)) ||
      favIds?.includes(m.id)
  );

  /*
   * RECENT MOVIES
   */
  const recentMovies = (allMovies || []).filter(
    (m: any) =>
      recentIds?.includes(String(m.id)) ||
      recentIds?.includes(m.id)
  );

  return (
    <div className="account-sheet-root">

      {/* =====================================================
          FIXED SHEET
          The sheet itself does NOT scroll.
          ===================================================== */}

      <div className="account-sheet-scroll">

        {/* ===================================================
            EDIT
            =================================================== */}

        <div className="account-top-edit-wrap">
          <button
            type="button"
            className="account-edit-btn"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("ug-open-edit-profile")
              )
            }
          >
            Edit
          </button>
        </div>

        {/* ===================================================
            PROFILE
            =================================================== */}

        <div className="account-avatar-wrap">

          <div className="account-avatar">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                draggable={false}
              />
            ) : (
              initial
            )}
          </div>

          <h2 className="account-name">
            {name}
          </h2>

          <p className="account-sub">
            {typeof email === "string" &&
            email.includes("@")
              ? email
              : "last seen 24/09/26"}
          </p>

        </div>

        {/* ===================================================
            ACTION CUBES
            =================================================== */}

        <div className="account-cubes">

          <Cube
            icon={<PlusIcon />}
            label="add"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("ug-open-lists-sheet")
              )
            }
          />

          <Cube
            icon={<BellIcon />}
            label="mute"
          />

          <Cube
            icon={<HeartIcon />}
            label="liked"
            onClick={() => {
              const target =
                document.getElementById("fav-row");

              target?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          />

          <Cube
            icon={<DownloadIcon />}
            label="saved"
          />

          <Cube
            icon={<MoreIcon />}
            label="more"
          />

        </div>

        {/* ===================================================
            MOBILE / ACCOUNT INFO
            =================================================== */}

        <div className="account-mobile-card">

          <div className="account-mobile-label">
            mobile
          </div>

          <div className="account-mobile-value">
            {user?.email || "+971 52 767 5021"}
          </div>

        </div>

        {/* ===================================================
            MOVIE LISTS
            =================================================== */}

        <div className="account-lists-wrap">

          {/* MY LIST */}

          <MovieRowPrivate
            title="my list"
            count={mainList?.movieIds?.length || 0}
            movies={myMovies}
            leading={
              <EmptyListCard
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent(
                      "ug-open-lists-sheet"
                    )
                  )
                }
              />
            }
          />

          {/* LIKED */}

          {favMovies.length > 0 && (
            <MovieRowPrivate
              id="fav-row"
              title="liked"
              count={favMovies.length}
              movies={favMovies}
            />
          )}

          {/* RECENT */}

          {recentMovies.length > 0 && (
            <MovieRowPrivate
              title="recent"
              count={recentMovies.length}
              movies={recentMovies}
            />
          )}

          {/* EMPTY STATE */}

          {myMovies.length === 0 &&
            favMovies.length === 0 &&
            recentMovies.length === 0 && (
              <div className="account-empty-hint">
                Your private lists will appear
                here. Tap + to create.
              </div>
            )}

        </div>

      </div>
    </div>
  );
}


/* ===========================================================
   MOVIE ROW
   =========================================================== */

function MovieRowPrivate({
  title,
  movies,
  count,
  leading,
  id,
}: {
  title: string;
  movies: any[];
  count: number;
  leading?: React.ReactNode;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="latest-root"
      id={id}
    >

      <div className="latest-head">

        <h3 className="latest-title">
          {title}
        </h3>

        <span className="latest-see">
          {count} movies
        </span>

      </div>

      <div className="latest-track-wrap">

        <div
          ref={ref}
          className="latest-track"
        >

          {leading}

          {movies.map((m: any) => (
            <MovieCardPrivate
              key={String(m.id)}
              m={m}
              allMovies={movies}
            />
          ))}

        </div>

      </div>

    </div>
  );
}


/* ===========================================================
   MOVIE CARD
   =========================================================== */

function MovieCardPrivate({
  m,
  allMovies,
}: {
  m: any;
  allMovies: any[];
}) {
  const { addRecent } = useMovieStore() as any;

  const { openDrawer } =
    useWatchDrawer() as any;

  const { openReels } =
    useReelsDrawer() as any;

  const router = useRouter();

  const openMovie = (
    type: "full" | "preview" = "full"
  ) => {
    const id = String(m.id);

    /*
     * Record recent movie
     */
    addRecent(id);

    /*
     * Preserve home scroll position
     */
    try {
      sessionStorage.setItem(
        "movies_home_scroll_v1",
        String(window.scrollY)
      );
    } catch {
      // Ignore sessionStorage errors
    }

    /*
     * Desktop
     */
    if (window.innerWidth > 768) {
      router.push(
        `/movies/watch/${id}?t=${type}`
      );

      return;
    }

    /*
     * Mobile preview
     */
    if (type === "preview") {
      openReels(
        allMovies?.map((x: any) => ({
          ...x,
          id: String(x.id),
          preview_url:
            x.preview_urls?.[0] ||
            x.preview_url,
        })),
        0
      );

      return;
    }

    /*
     * Mobile full movie
     */
    openDrawer(id);
  };

  return (
    <div
      className="latest-card"
      onClick={() => openMovie("full")}
    >

      <div className="l-card-cover">

        <img
          src={
            m.cover ||
            m.cover_url
          }
          alt={m.title}
          loading="lazy"
          draggable={false}
        />

        <div className="l-card-fade" />

        <div className="l-card-actions">

          <button
            type="button"
            className="l-a-btn play on"
            onClick={(e) => {
              e.stopPropagation();
              openMovie("full");
            }}
          >
            PLAY
          </button>

          <button
            type="button"
            className="l-a-btn prev on"
            onClick={(e) => {
              e.stopPropagation();
              openMovie("preview");
            }}
          >
            PRE
          </button>

        </div>

      </div>

    </div>
  );
}


/* ===========================================================
   EMPTY CREATE-LIST CARD
   =========================================================== */

function EmptyListCard({
  onClick,
}: {
  onClick?: () => void;
}) {
  return (
    <div
      className="latest-card"
      onClick={onClick}
    >

      <div className="l-card-cover dashed">

        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
          style={{
            opacity: 0.7,
          }}
        >
          <line
            x1="12"
            y1="5"
            x2="12"
            y2="19"
          />

          <line
            x1="5"
            y1="12"
            x2="19"
            y2="12"
          />
        </svg>

      </div>

      <div className="l-card-title centered">
        create list
      </div>

    </div>
  );
}


/* ===========================================================
   ACTION CUBE
   =========================================================== */

function Cube({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="account-cube"
      onClick={onClick}
    >
      {icon}

      <span>
        {label}
      </span>
    </button>
  );
}


/* ===========================================================
   SVG ICONS
   =========================================================== */

function PlusIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}


function BellIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2a7 7 0 0 0-7 7v4.5l-1.5 1.5V16h17v-1L19 13.5V9a7 7 0 0 0-7-7Z" />
    </svg>
  );
}


function HeartIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 21s-6.5-4.35-8.5-8.5A5 5 0 0 1 12 6a5 5 0 0 1 8.5 6.5C18.5 16.65 12 21 12 21Z" />
    </svg>
  );
}


function DownloadIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 3v13" />
      <path d="M5 16l7 5 7-5" />
      <path d="M3 21h18" />
    </svg>
  );
}


function MoreIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle
        cx="5"
        cy="12"
        r="2"
      />

      <circle
        cx="12"
        cy="12"
        r="2"
      />

      <circle
        cx="19"
        cy="12"
        r="2"
      />
    </svg>
  );
}