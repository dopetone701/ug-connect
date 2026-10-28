// src/app/(dashboard)/control-center-page/components/create-movie/parts/single-movie-uploads.tsx
"use client";
import React from "react";
import UploadBox from "./upload-box";


interface SingleMovieUploadsProps {
  /** true for Mini / TV series: only the cover box is shown (full width) */
  seriesMode: boolean;
  mainRef: React.RefObject<HTMLInputElement | null>;
  coverRef: React.RefObject<HTMLInputElement | null>;
  movieUrl: string | null;
  coverUrl: string | null;
  mainProg: number;
  coverProg: number;
  previewFiles: File[];
  onMainChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPreviewsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


/**
 * One set of boxes for every movie type. The main-movie and previews boxes are only
 * hidden (not removed) in series mode, so the chosen cover file survives switching type.
 */
export default function SingleMovieUploads({
  seriesMode,
  mainRef,
  coverRef,
  movieUrl,
  coverUrl,
  mainProg,
  coverProg,
  previewFiles,
  onMainChange,
  onCoverChange,
  onPreviewsChange,
}: SingleMovieUploadsProps) {
  return (
    <div className="cc-upload-grid">
      <UploadBox
        label="🎬 MAIN MOVIE *"
        accept="video/*"
        inputRef={mainRef}
        onChange={onMainChange}
        progress={mainProg}
        style={seriesMode ? { display: "none" } : undefined}
      >
        {movieUrl && (
          <video
            src={movieUrl}
            controls
            style={{ width: "100%", marginTop: 10, borderRadius: 8, maxHeight: 180 }}
          />
        )}
      </UploadBox>

      <UploadBox
        label={seriesMode ? "🖼️ SERIES COVER ART *" : "🖼️ COVER ART *"}
        accept="image/*"
        inputRef={coverRef}
        onChange={onCoverChange}
        progress={coverProg}
        style={seriesMode ? { gridColumn: "1/-1" } : undefined}
      >
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt="cover"
            style={{ width: "100%", marginTop: 10, borderRadius: 8, maxHeight: 180, objectFit: "cover" }}
          />
        )}
      </UploadBox>

      <UploadBox
        label="🎞️ PREVIEWS (optional)"
        accept="video/*,image/*"
        multiple
        onChange={onPreviewsChange}
        style={{ gridColumn: "1/-1", display: seriesMode ? "none" : undefined }}
        hint={previewFiles.length > 0 ? `${previewFiles.length} files selected` : undefined}
      />
    </div>
  );
}


