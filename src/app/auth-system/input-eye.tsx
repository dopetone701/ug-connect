"use client";
import { useState } from "react";

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.53 9.53a3 3 0 1 0 4.27 4.27" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PasswordInput({ value, onChange, placeholder = "Password", className = "", ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="ug-pass-wrap">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`ug-input ug-input-pass ${className}`}
        {...props}
      />
      <button type="button" className="ug-eye-btn" onClick={() => setShow(!show)} tabIndex={-1} aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

export default PasswordInput;

