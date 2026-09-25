"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMovieStore } from "@/stores/use-movie-store";

export default function UnderVideoStaBtns({
  movie,
  paramsId,
  onPreview,
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    lists,
    addToMyList,
    removeFromMyList,
    createList,
  } = useMovieStore() as any;

  const mainList = lists?.[0];

  const isInMyList =
    mainList?.movieIds?.includes(Number(paramsId)) ||
    mainList?.movieIds?.includes(String(paramsId));

  const isPreview = searchParams.get("t") === "preview";

  const handleMyList = () => {
    if (!mainList) {
      createList("my-list");
      return;
    }

    if (isInMyList) {
      removeFromMyList(movie.id);
    } else {
      addToMyList(movie.id);
    }
  };

  const handlePlayToggle = () => {
    /*
     * PC / DESKTOP
     *
     * Stay inside the Connect player.
     * NEVER open Reels on desktop.
     */
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      router.push(
        `/movies/watch/${String(paramsId)}?t=${
          isPreview ? "full" : "preview"
        }`
      );

      return;
    }

    /*
     * MOBILE
     *
     * Full movie -> Preview
     * Let the existing mobile preview handler
     * open the Reels drawer.
     */
    if (!isPreview) {
      if (onPreview) {
        onPreview();
      }

      return;
    }

    /*
     * MOBILE
     *
     * Preview -> Full movie.
     * Stay on the Connect/watch route.
     */
    router.push(
      `/movies/watch/${String(paramsId)}?t=full`
    );
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          url,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
      } catch {}
    }
  };

  return (
    <div className="connect-action-row">
      {/* PREVIEW / FULL TOGGLE */}
      <button
        type="button"
        className="c-action-btn primary"
        onClick={handlePlayToggle}
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

        {isPreview ? "Watch Full Movie" : "Play Preview"}
      </button>

      {/* MY LIST */}
      <button
        type="button"
        className={`c-action-btn ${
          isInMyList ? "active" : ""
        }`}
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

      {/* SHARE */}
      <button
        type="button"
        className="c-action-btn"
        onClick={handleShare}
      >
        Share
      </button>
    </div>
  );
}
