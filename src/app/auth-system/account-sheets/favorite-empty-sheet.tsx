"use client";
import "./favorite-empty-sheet.css";
import LibraryIcon from "@/modal-generator/svg-icons/library-icon";

type Props = {
  onBrowse?: () => void;
};

export default function FavoriteEmptySheet({ onBrowse }: Props) {
  const goMovies = () => {
    if (onBrowse) onBrowse();
    else window.location.href = "/movies";
  };

  const openSheet = (id: string) => {
    window.dispatchEvent(new CustomEvent("ug-open-account-sheet" as any, { detail: { sheet: id } }));
  };

  return (
    <div className="fav-empty-root">
      {/* Icon */}
      <div className="fav-empty-icon-wrap">
        <div className="fav-empty-icon-inner">
          <LibraryIcon size={42} className="fav-empty-icon" />
        </div>
      </div>

      <h2 className="fav-empty-title">Your Library is empty</h2>
      <p className="fav-empty-sub">
        Movies you save, like and watch will live here. Your personal lists are just getting started.
      </p>

      {/* Where lists will appear */}
      <div className="fav-empty-lists">
        <button className="fav-empty-list-row" onClick={() => openSheet("favorites")} type="button">
          <div className="fav-empty-list-left">
            <span className="fav-empty-list-icon">★</span>
            <div>
              <p className="fav-empty-list-name">My List</p>
              <p className="fav-empty-list-desc">Movies you saved for later</p>
            </div>
          </div>
          <span className="fav-empty-list-count">0</span>
        </button>

        <button className="fav-empty-list-row" onClick={() => openSheet("history")} type="button">
          <div className="fav-empty-list-left">
            <span className="fav-empty-list-icon">◷</span>
            <div>
              <p className="fav-empty-list-name">Watch History</p>
              <p className="fav-empty-list-desc">Continue where you left off</p>
            </div>
          </div>
          <span className="fav-empty-list-count">0</span>
        </button>

        <button className="fav-empty-list-row" onClick={() => openSheet("liked")} type="button">
          <div className="fav-empty-list-left">
            <span className="fav-empty-list-icon">♥</span>
            <div>
              <p className="fav-empty-list-name">Liked</p>
              <p className="fav-empty-list-desc">Movies you hearted</p>
            </div>
          </div>
          <span className="fav-empty-list-count">0</span>
        </button>
      </div>

      <button className="fav-empty-browse" onClick={goMovies} type="button">
        Browse Movies
      </button>
    </div>
  );
}

