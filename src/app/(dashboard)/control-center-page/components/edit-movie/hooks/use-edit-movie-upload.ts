// edit-movie/hooks/use-edit-movie-upload.ts - upload state for edit

"use client";
import { useState, useRef } from "react";

export interface PreviewVideoDraft {
  id: string;
  existingKey: string | null; // R2 key already in D1
  file: File | null;
  objectUrl: string | null;
  progress: number;
  status: "idle" | "uploading" | "done" | "error";
}

export function useEditMovieUpload(initialPreviewUrls: string[] = []) {
  const [coverPreview, setCoverPreview] = useState("");
  const [moviePreview, setMoviePreview] = useState("");
  const [currentCoverKey, setCurrentCoverKey] = useState<string | null>(null);
  const [currentMainKey, setCurrentMainKey] = useState<string | null>(null);
  const [previewVideos, setPreviewVideos] = useState<PreviewVideoDraft[]>(() =>
    initialPreviewUrls.map((k) => ({
      id: crypto.randomUUID(),
      existingKey: k,
      file: null,
      objectUrl: null,
      progress: 0,
      status: "done" as const,
    }))
  );
  const [coverProg, setCoverProg] = useState(0);
  const [mainProg, setMainProg] = useState(0);
  const [uploading, setUploading] = useState(false);

  const mainRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const updatePreviewProgress = (id: string, progress: number) => {
    setPreviewVideos((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, progress, status: "uploading" as const } : x
      )
    );
  };

  const updatePreviewDone = (id: string, newKey: string) => {
    setPreviewVideos((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, progress: 100, status: "done" as const, existingKey: newKey }
          : x
      )
    );
  };

  const updateEpisodeStatus = (
    seasonId: string,
    epId: string,
    patch: Partial<{ progress: number; status: "idle" | "uploading" | "done" | "error" }>,
    setSeasons: any
  ) => {
    setSeasons((prev: any[]) =>
      prev.map((s) =>
        s.id !== seasonId
          ? s
          : {
              ...s,
              episodes: s.episodes.map((e: any) =>
                e.id === epId ? { ...e, ...patch } : e
              ),
            }
      )
    );
  };

  const resetUploadState = () => {
    setCoverPreview("");
    setMoviePreview("");
    setCurrentCoverKey(null);
    setCurrentMainKey(null);
    setPreviewVideos([]);
    setCoverProg(0);
    setMainProg(0);
    setUploading(false);
  };

  return {
    coverPreview,
    setCoverPreview,
    moviePreview,
    setMoviePreview,
    currentCoverKey,
    setCurrentCoverKey,
    currentMainKey,
    setCurrentMainKey,
    previewVideos,
    setPreviewVideos,
    coverProg,
    setCoverProg,
    mainProg,
    setMainProg,
    uploading,
    setUploading,
    mainRef,
    coverRef,
    updatePreviewProgress,
    updatePreviewDone,
    updateEpisodeStatus,
    resetUploadState,
  };
}
