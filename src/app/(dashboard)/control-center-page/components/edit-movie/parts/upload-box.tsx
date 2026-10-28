// edit-movie/parts/upload-box.tsx - reusable upload box

"use client";

type Props = {
  label: string;
  hasExisting: boolean;
  existingKey?: string | null;
  onDownload?: () => void;
  onFileChange: (file: File) => void;
  progress: number;
  preview?: string;
  isVideo?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

export default function UploadBox({
  label,
  hasExisting,
  onDownload,
  onFileChange,
  progress,
  preview,
  isVideo,
  inputRef,
}: Props) {
  return (
    <div className="cc-up-box">
      <label>
        {label} {hasExisting ? "- exists" : "- no file"}
      </label>
      {hasExisting && onDownload && (
        <button
          onClick={onDownload}
          className="cc-btn ghost"
          style={{ fontSize: 12, marginBottom: 6 }}
        >
          ⬇️ Download Current
        </button>
      )}
      <input
        type="file"
        ref={inputRef as any}
        accept={isVideo ? "video/*" : "image/*"}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
        }}
      />
      <div
        className="prog"
        style={{ display: progress > 0 ? "block" : "none", marginTop: 10 }}
      >
        <div className="prog-bar">
          <div className="prog-fill" style={{ width: progress + "%" }}></div>
        </div>
        <span className="prog-text">{progress}%</span>
      </div>
      {preview && (
        <>
          {isVideo ? (
            <video
              src={preview}
              controls
              style={{
                width: "100%",
                marginTop: 10,
                borderRadius: 8,
                maxHeight: 180,
                background: "#000",
              }}
            />
          ) : (
            <img
              src={preview}
              style={{
                width: "100%",
                marginTop: 10,
                borderRadius: 8,
                maxHeight: 180,
                objectFit: "cover",
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
