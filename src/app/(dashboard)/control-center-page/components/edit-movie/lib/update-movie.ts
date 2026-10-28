// edit-movie/lib/update-movie.ts - FIXED no duplicate

import { API_URL } from "../constants";
import type { MoviePayload } from "../types";

export async function updateMovie(movieId: string, payload: MoviePayload) {
  const body = {
    title: payload.title?.trim(),
    genre: payload.genre?.trim(),
    vj: payload.vj?.trim(),
    type: payload.type,
    year: payload.year || null,
    actors: payload.actors?.trim(),
    cast: payload.cast, // <-- ONLY ONE, no quotes needed in JSON
    description: payload.description?.trim(),
    cover_url: payload.cover_url,
    main_url: payload.main_url || null,
    video_url: payload.main_url || null,
    preview_urls: payload.preview_urls || [],
    seasons: payload.seasons || [],
  };

  const res = await fetch(`${API_URL}/${movieId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update failed ${res.status}: ${text}`);
  }

  return res.json();
}

export async function fetchMovieById(movieId: string) {
  const res = await fetch(`${API_URL}/${movieId}?t=${Date.now()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Fetch movie failed ${res.status}`);
  const data = await res.json();
  return data.movie || data.data || data;
}
