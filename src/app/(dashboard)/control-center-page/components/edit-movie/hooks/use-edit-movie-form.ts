// edit-movie/hooks/use-edit-movie-form.ts - form state with initialData support

"use client";
import { useState, useEffect } from "react";
import type { MovieType, CastMember, SeasonDraft, MoviePayload } from "../types";

export function useEditMovieForm(initialData?: MoviePayload & { id?: string }) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [vj, setVj] = useState("VJ Junior");
  const [type, setType] = useState<MovieType>("Single");
  const [year, setYear] = useState("");
  const [actors, setActors] = useState("");
  const [cast, setCast] = useState<CastMember[]>([]);
  const [description, setDescription] = useState("");
  const [seasons, setSeasons] = useState<SeasonDraft[]>([]);

  // Fill from initialData when movie is loaded
  useEffect(() => {
    if (!initialData) return;
    
    setTitle(initialData.title || "");
    setGenre(initialData.genre || "");
    setVj(initialData.vj || "VJ Junior");
    setType((initialData.type as MovieType) || "Single");
    setYear(String(initialData.year || ""));
    setActors(initialData.actors || "");
    setCast(initialData.cast || []);
    setDescription(initialData.description || "");
    
    if (initialData.seasons?.length) {
      // Normalize seasons
      let sd: any = initialData.seasons;
      if (typeof sd === "string") {
        try { sd = JSON.parse(sd); } catch { sd = []; }
      }
      const mapped: SeasonDraft[] = sd.map((s: any) => ({
        id: s.id || crypto.randomUUID(),
        name: s.name || `Season ${sd.indexOf(s) + 1}`,
        episodes: (s.episodes || []).map((ep: any) => ({
          id: ep.id || crypto.randomUUID(),
          title: ep.title,
          main_url: ep.main_url || ep.video_url || "",
          preview_url: ep.preview_url || null,
          file: null,
          objectUrl: null,
          progress: 0,
          status: "done" as const,
        })),
      }));
      setSeasons(mapped);
    } else {
      setSeasons([]);
    }
  }, [initialData]);

  const reset = () => {
    setTitle("");
    setGenre("");
    setVj("VJ Junior");
    setType("Single");
    setYear("");
    setActors("");
    setCast([]);
    setDescription("");
    setSeasons([]);
  };

  const isValid = () => {
    return title.trim().length > 0 && year.trim().length > 0;
  };

  return {
    // values
    title,
    genre,
    vj,
    type,
    year,
    actors,
    cast,
    description,
    seasons,
    // setters
    setTitle,
    setGenre,
    setVj,
    setType,
    setYear,
    setActors,
    setCast,
    setDescription,
    setSeasons,
    // helpers
    reset,
    isValid,
  };
}
