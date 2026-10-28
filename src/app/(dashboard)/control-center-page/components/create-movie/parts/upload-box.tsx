// src/app/(dashboard)/control-center-page/components/create-movie/parts/upload-box.tsx
"use client";
import React from "react";

interface UploadBoxProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  progress?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hint?: string;
}

export default function UploadBox({
  label,
  accept,
  multiple,
  inputRef,
  onChange,
  progress = 0,
  children,
  className = "cc-up-box",
  style,
  hint,
}: UploadBoxProps) {
  return (
    <div className={className} style={style}>
      <label>{label}</label>
      <input
        type="file"
        ref={inputRef as any}
        accept={accept}
        multiple={multiple}
        onChange={onChange}
      />
      {children}
      {hint && <small>{hint}</small>}
      <div className="prog" style={{ display: progress > 0 ? "block" : "none" }}>
        <div className="prog-bar">
          <div className="prog-fill" style={{ width: progress + "%" }}></div>
        </div>
        <span className="prog-text">{progress}%</span>
      </div>
    </div>
  );
}
