// edit-movie/lib/save-movie.ts - not used for edit, but keeps structure same as create-movie

import { API_URL } from "../constants";
import type { MoviePayload } from "../types";

export async function saveMovie(payload: MoviePayload) {
  // This is for create - edit uses updateMovie
  // Kept here so folder structure matches create-movie 1:1
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
