"use client";

import { useState, useEffect } from "react";

import type {
  MovieType,
  CastMember,
  SeasonDraft,
  MoviePayload,
} from "../types";

import type { MovieCategoryId } from "../constants";

type InitialMovieData = MoviePayload & {
  id?: string;
  category?: string;
  origin?: string;
  country?: string;
};

function parseArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];

  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function getMovieCategory(
  movie?: InitialMovieData
): MovieCategoryId | "" {
  if (!movie) return "";

  const value =
    movie.category ||
    movie.origin ||
    movie.country ||
    "";

  return value as MovieCategoryId | "";
}

function mapSeasons(value: unknown): SeasonDraft[] {
  const source = parseArray<any>(value);

  return source.map((season, seasonIndex) => ({
    id: season.id || crypto.randomUUID(),

    name: season.name || `Season ${seasonIndex + 1}`,

    episodes: (Array.isArray(season.episodes)
      ? season.episodes
      : []
    ).map((episode: any) => ({
      id: episode.id || crypto.randomUUID(),

      title: episode.title || "",

      main_url:
        episode.main_url ||
        episode.video_url ||
        "",

      preview_url: episode.preview_url || null,

      file: null,
      objectUrl: null,
      progress: 0,
      status: "done" as const,
    })),
  }));
}

export function useEditMovieForm(
  initialData?: InitialMovieData
) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [vj, setVj] = useState("VJ Junior");
  const [type, setType] = useState<MovieType>("Single");
  const [year, setYear] = useState("");
  const [actors, setActors] = useState("");

  const [cast, setCast] = useState<CastMember[]>([]);

  const [description, setDescription] = useState("");

  const [seasons, setSeasons] = useState<SeasonDraft[]>([]);

  // Category state used by the category dropdown.
  const [category, setCategory] =
    useState<MovieCategoryId | "">("");

  // Populate the form whenever a different movie is loaded.
  useEffect(() => {
    if (!initialData) return;

    setTitle(initialData.title || "");
    setGenre(initialData.genre || "");
    setVj(initialData.vj || "VJ Junior");

    setType(
      (initialData.type as MovieType) || "Single"
    );

    setYear(
      initialData.year != null
        ? String(initialData.year)
        : ""
    );

    setActors(initialData.actors || "");

    setCast(
      parseArray<CastMember>(initialData.cast)
    );

    setDescription(initialData.description || "");

    // Read the saved category, supporting existing field names.
    setCategory(getMovieCategory(initialData));

    setSeasons(mapSeasons(initialData.seasons));
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
    setCategory("");
  };

  const isValid = () => {
    return (
      title.trim().length > 0 &&
      year.trim().length > 0
    );
  };

  return {
    // Values
    title,
    genre,
    vj,
    type,
    year,
    actors,
    cast,
    description,
    seasons,
    category,

    // Setters
    setTitle,
    setGenre,
    setVj,
    setType,
    setYear,
    setActors,
    setCast,
    setDescription,
    setSeasons,
    setCategory,

    // Helpers
    reset,
    isValid,
  };
}
