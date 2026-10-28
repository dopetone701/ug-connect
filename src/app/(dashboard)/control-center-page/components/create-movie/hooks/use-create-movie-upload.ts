// src/app/(dashboard)[STRIPPED 74 bytes].ts
"use client";
import { useState, useCallback } from "react";

export function useCreateMovieUpload() {
  const [uploading, setUploading] = useState(false);
  const [coverProg, setCoverProg] = useState(0);
  const [mainProg, setMainProg] = useState(0);
  const [seasons, setSeasons] = useState<any[]>([]);

  const updateEpStatus = useCallback(
    (seasonId: string, epId: string, patch: any) => {
      setSeasons((prev: any[]) =>
        prev.map((s: any) =>
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
    },
    []
  );

  const resetUploadState = useCallback(() => {
    setUploading(false);
    setCoverProg(0);
    setMainProg(0);
  }, []);

  const resetAll = useCallback(() => {
    setSeasons([]);
    setCoverProg(0);
    setMainProg(0);
    setUploading(false);
  }, []);

  return {
    uploading,
    setUploading,
    coverProg,
    setCoverProg,
    mainProg,
    setMainProg,
    seasons,
    setSeasons,
    updateEpStatus,
    resetUploadState,
    resetAll,
  };
}
