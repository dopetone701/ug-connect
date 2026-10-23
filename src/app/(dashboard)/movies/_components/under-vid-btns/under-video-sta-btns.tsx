"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMovieStore } from "@/stores/use-movie-store";
import { useState, useEffect, useCallback } from "react";
import HeartIcon from "@/modal-generator/svg-icons/heart-icon";
import ShareAtomIcon from "@/modal-generator/svg-icons/share-atom-icon";


const WORKER_URL = "https://movie-actions-server-api.connectu89.workers.dev/heart";

function getDeviceId() {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("ugc_device_id");
  if (!id) {
    id = `dev_${Math.random().toString(36).slice(2)}${Date.now()}`;
    localStorage.setItem("ugc_device_id", id);
  }
  return id;
}

function getLocalLike(movieId: string) {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`ugc_heart_${movieId}`) === "1";
}

function setLocalLike(movieId: string, liked: boolean) {
  if (liked) localStorage.setItem(`ugc_heart_${movieId}`, "1");
  else localStorage.removeItem(`ugc_heart_${movieId}`);
}

export default function UnderVideoStaBtns({
  movie,
  paramsId,
  onPreview,
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { lists, addToMyList, removeFromMyList } = useMovieStore() as any;

  const myList = lists?.find((l:any)=> l.id==="my-list") || lists?.[0];
  const targetId = String(movie?.id ?? paramsId);
  const isInMyList = myList?.movieIds?.some((x:any)=> String(x)===String(targetId));
  const isPreview = searchParams.get("t") === "preview";

  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    setLiked(getLocalLike(targetId));
    const onStorage = (e: StorageEvent) => {
      if (e.key === `ugc_heart_${targetId}`) setLiked(e.newValue === "1");
    };
    const onCustom = () => setLiked(getLocalLike(targetId));
    window.addEventListener("storage", onStorage);
    window.addEventListener(`ugc_heart_updated_${targetId}` as any, onCustom);
    window.addEventListener("ugc_heart_updated" as any, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(`ugc_heart_updated_${targetId}` as any, onCustom);
      window.removeEventListener("ugc_heart_updated" as any, onCustom);
    };
  }, [targetId]);

  const handleHeart = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const newLiked = !liked;
    const deviceId = getDeviceId();
    setLiked(newLiked);
    setLocalLike(targetId, newLiked);
    setPop(true);
    setTimeout(() => setPop(false), 320);
    try {
      localStorage.setItem(`ugc_heart_updated_${targetId}`, Date.now().toString());
      window.dispatchEvent(new CustomEvent(`ugc_heart_updated_${targetId}`));
      window.dispatchEvent(new CustomEvent("ugc_heart_updated"));
    } catch {}
    try {
      await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: targetId, deviceId, action: newLiked ? "like" : "unlike" }),
      });
    } catch {}
    setTimeout(() => setBusy(false), 300);
  }, [liked, targetId, busy]);

  const handleMyList = () => {
    if (isInMyList) removeFromMyList(targetId);
    else addToMyList(targetId);
  };

  const handlePlayToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      router.push(`/movies/watch/${String(paramsId)}?t=${isPreview ? "full" : "preview"}`);
      return;
    }
    if (!isPreview) { if (onPreview) onPreview(); return; }
    router.push(`/movies/watch/${String(paramsId)}?t=full`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: movie.title, url }); } catch {} }
    else { try { await navigator.clipboard.writeText(url); alert("Link copied!"); } catch {} }
  };

  return (
    <div className="connect-action-row">
      <button type="button" className="c-action-btn primary" onClick={handlePlayToggle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M8 5.14v14l11-7-11-7z" />
        </svg>
        {isPreview ? "Watch Full Movie" : "Play Preview"}
      </button>

      <button
        type="button"
        className={`c-action-btn ${liked ? "active" : ""} ${pop ? "heart-pop" : ""}`}
        onClick={handleHeart}
        aria-label="Like"
        style={{ color: liked ? "#ff3040" : undefined }}
      >
        <HeartIcon
          size={16}
          filled={liked}
          style={{
            color: liked ? "#ff3040" : "currentColor",
            fill: liked ? "#ff3040" : "transparent",
            stroke: liked ? "#ff3040" : "currentColor",
          }}
        />
        {liked ? "Liked" : "Like"}
      </button>

      <button type="button" className={`c-action-btn ${isInMyList ? "active" : ""}`} onClick={handleMyList}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14" /><path d="M5 12h14" />
        </svg>
        {isInMyList ? "In My List" : "My List"}
      </button>

           <button type="button" className="c-action-btn" onClick={handleShare}>
        <ShareAtomIcon size={16} />
        Share
      </button>

    </div>
  );
}

