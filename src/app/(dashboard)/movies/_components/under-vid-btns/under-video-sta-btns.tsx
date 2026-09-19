"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMovieStore } from "../../_lib/use-movie-store";

export default function UnderVideoStaBtns({
  movie,
  paramsId,
  isPreview,
}: any) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    lists,
    addToList,
    removeFromList,
    createList,
  } = useMovieStore() as any;

  const mainList = lists?.[0];

  const isInMyList =
    mainList?.movieIds?.includes(Number(paramsId)) ||
    mainList?.movieIds?.includes(String(paramsId));

  const handleMyList = () => {
    if (!mainList) {
      createList("my-list");
      return;
    }

    if (isInMyList) {
      removeFromList(mainList.id, movie.id);
    } else {
      addToList(mainList.id, movie.id);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${pathname}?t=full`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          url,
        });
      } catch {
        // User cancelled the share sheet.
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
      } catch {
        // Clipboard unavailable.
      }
    }
  };

  const handlePlayPreview = () => {
    const currentType =
      new URLSearchParams(window.location.search).get("t");

    const nextType = currentType === "preview" ? "full" : "preview";

    router.push(`${pathname}?t=${nextType}`);
  };

  return (
    <div className="connect-action-row">
      <button
        className="c-action-btn primary"
        onClick={handlePlayPreview}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="white"
          aria-hidden="true"
        >
          <path d="M8 5.14v14l11-7-11-7z" />
        </svg>

        {isPreview ? "Play Full" : "Play Preview"}
      </button>

      <button
        className={`c-action-btn ${isInMyList ? "active" : ""}`}
        onClick={handleMyList}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>

        {isInMyList ? "In My List" : "My List"}
      </button>

      <button
        className="c-action-btn"
        onClick={handleShare}
      >
        Share
      </button>
    </div>
  );
}
