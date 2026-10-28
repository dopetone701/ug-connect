// src/app/(dashboard)/control-center-page/components/create-movie/lib/save-movie.ts
import { API_ENDPOINTS } from "../constants";
import type { MoviePayload } from "../types";

export async function saveMovie(payload: MoviePayload): Promise<any> {
  const saveRes = await fetch(API_ENDPOINTS.MOVIES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!saveRes.ok) {
    const errorText = await saveRes.text();
    throw new Error(errorText || "Failed to save movie");
  }

  // Return parsed response if available, preserving original behavior
  try {
    return await saveRes.json();
  } catch {
    return await saveRes.text();
  }
}
