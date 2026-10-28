// src/app/(dashboard)/control-center-page/components/create-movie/hooks/use-create-movie-form.ts
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import type { ActorDraft, MovieType } from "../types";


/** All the form fields + file pickers. (Upload progress lives in use-create-movie-upload.) */
export function useCreateMovieForm() {
  const [type, setType] = useState<MovieType>("Single");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [genre, setGenre] = useState("");
  const [vj, setVj] = useState("VJ Junior");
  const [actors, setActors] = useState<ActorDraft[]>([]);
  const [desc, setDesc] = useState("");

  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [movieUrl, setMovieUrl] = useState<string | null>(null);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);

  const mainRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const actorsRef = useRef(actors);
  actorsRef.current = actors;

  const isSeries = type !== "Single";

  // free the browser preview URLs when they change or the modal goes away
  useEffect(() => () => { if (coverUrl) URL.revokeObjectURL(coverUrl); }, [coverUrl]);
  useEffect(() => () => { if (movieUrl) URL.revokeObjectURL(movieUrl); }, [movieUrl]);

  const onCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setCoverUrl(f ? URL.createObjectURL(f) : null);
  };
  const onMainChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setMovieUrl(f ? URL.createObjectURL(f) : null);
  };
  const onPreviewsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPreviewFiles(Array.from(e.target.files || []));
  };

  /** Clears every field, file and preview, so the next movie starts clean. */
  const resetForm = useCallback(() => {
    actorsRef.current.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
    setType("Single");
    setTitle("");
    setYear(new Date().getFullYear().toString());
    setGenre("");
    setVj("VJ Junior");
    setActors([]);
    setDesc("");
    setCoverUrl(null);
    setMovieUrl(null);
    setPreviewFiles([]);
    if (mainRef.current) mainRef.current.value = "";
    if (coverRef.current) coverRef.current.value = "";
  }, []);

  return {
    type, setType, isSeries,
    title, setTitle,
    year, setYear,
    genre, setGenre,
    vj, setVj,
    actors, setActors,
    desc, setDesc,
    coverUrl, movieUrl,
    previewFiles,
    mainRef, coverRef,
    onCoverChange, onMainChange, onPreviewsChange,
    resetForm,
  };
}


