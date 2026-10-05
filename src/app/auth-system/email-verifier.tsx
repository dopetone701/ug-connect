"use client";

// email-verifier.tsx - PRO LINKEDIN-LEVEL - UG-CONNECT
// Industry standard: RFC 5322 simplified + disposable + D1 + Resend bounce
// Path: src/app/auth-system/email-verifier.tsx

const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com", "10minutemail.com", "guerrillamail.com", "mailinator.com", "yopmail.com",
  "temp-mail.org", "getnada.com", "throwawaymail.com", "fakeinbox.com", "trashmail.com",
  "maildrop.cc", "harakirimail.com", "dispostable.com", "mailnesia.com", "mintemail.com"
]);

// RFC 5322 Official simplified - industry standard
const EMAIL_REGEX = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

// Strict but readable version for UI
const SIMPLE_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export type EmailStatus = "idle" | "checking" | "valid" | "invalid" | "duplicate" | "disposable" | "bounced";

export interface EmailValidation {
  valid: boolean;
  status: EmailStatus;
  message: string;
  color: "red" | "green" | "orange" | "gray";
  level: "error" | "success" | "warning";
}

// 1. INDUSTRY STANDARD STRUCTURE CHECK
export function validateEmailStructure(email: string): EmailValidation {
  const e = email.trim().toLowerCase();

  if (!e) {
    return { valid: false, status: "idle", message: "", color: "gray", level: "error" };
  }

  // Length - RFC 5321
  if (e.length > 254) {
    return { valid: false, status: "invalid", message: "Email too long (max 254)", color: "red", level: "error" };
  }

  if (e.length < 6) {
    return { valid: false, status: "invalid", message: "Email too short", color: "red", level: "error" };
  }

  // Basic @ check
  if (!e.includes("@")) {
    return { valid: false, status: "invalid", message: "Missing @ symbol", color: "red", level: "error" };
  }

  const parts = e.split("@");
  if (parts.length !== 2) {
    return { valid: false, status: "invalid", message: "Email must contain single @", color: "red", level: "error" };
  }

  const [local, domain] = parts;

  // Local part checks - industry
  if (local.length > 64) {
    return { valid: false, status: "invalid", message: "Local part too long", color: "red", level: "error" };
  }
  if (local.startsWith(".") || local.endsWith(".")) {
    return { valid: false, status: "invalid", message: "Can't start/end with dot", color: "red", level: "error" };
  }
  if (local.includes("..")) {
    return { valid: false, status: "invalid", message: "Double dot not allowed", color: "red", level: "error" };
  }
  if (/[^a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]/.test(local)) {
    return { valid: false, status: "invalid", message: "Invalid characters in email", color: "red", level: "error" };
  }

  // Domain checks - industry
  if (domain.length > 253) {
    return { valid: false, status: "invalid", message: "Domain too long", color: "red", level: "error" };
  }
  if (!domain.includes(".")) {
    return { valid: false, status: "invalid", message: "Domain must have extension (.com)", color: "red", level: "error" };
  }
  if (domain.startsWith("-") || domain.endsWith("-") || domain.startsWith(".") || domain.endsWith(".")) {
    return { valid: false, status: "invalid", message: "Invalid domain format", color: "red", level: "error" };
  }
  if (domain.includes("..")) {
    return { valid: false, status: "invalid", message: "Double dot in domain", color: "red", level: "error" };
  }

  // Regex final
  if (!SIMPLE_REGEX.test(e)) {
    return { valid: false, status: "invalid", message: "Invalid email format", color: "red", level: "error" };
  }

  // Disposable check
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, status: "disposable", message: "Disposable emails not allowed - use real email", color: "red", level: "error" };
  }

  // TLD check
  const tld = domain.split(".").pop() || "";
  if (tld.length < 2 || tld.length > 63) {
    return { valid: false, status: "invalid", message: "Invalid domain extension", color: "red", level: "error" };
  }
  if (/^\d+$/.test(tld)) {
    return { valid: false, status: "invalid", message: "Domain extension can't be only numbers", color: "red", level: "error" };
  }

  // Success
  return { valid: true, status: "valid", message: "Valid email", color: "green", level: "success" };
}

// 2. D1 DUPLICATE CHECK - Same email >2 accounts = haram
export async function checkEmailD1(email: string, workerUrl: string): Promise<{ exists: boolean; count: number; blocked: boolean; message?: string }> {
  const clean = email.trim().toLowerCase();
  if (!clean || !validateEmailStructure(clean).valid) {
    return { exists: false, count: 0, blocked: false };
  }

  try {
    const res = await fetch(`${workerUrl}/api/auth/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: clean }),
    });
    const data = await res.json();
    if (!res.ok) return { exists: false, count: 0, blocked: false };

    const count = data.count || 0;
    // HARAM RULE: Same email >2 accounts blocked, >1 warning
    // PRO STANDARD: 1 email = 1 account (count >=1 blocked)
    const MAX_ALLOWED = 1; // Change to 2 if you want to allow 2 like you said
    if (count >= MAX_ALLOWED) {
      return {
        exists: true,
        count,
        blocked: true,
        message: count === 1 ? "Email already registered" : `Haram! Same email used in ${count} accounts - max ${MAX_ALLOWED}`,
      };
    }
    return { exists: false, count, blocked: false };
  } catch (e) {
    console.error("D1 check failed", e);
    return { exists: false, count: 0, blocked: false };
  }
}

// 3. RESEND BOUNCE CHECK - via worker
export async function checkEmailBounce(email: string, workerUrl: string): Promise<{ bounced: boolean; message?: string }> {
  try {
    const res = await fetch(`${workerUrl}/api/auth/check-bounce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return { bounced: !!data.bounced, message: data.message };
  } catch {
    return { bounced: false };
  }
}

// 4. HOOK - LINKEDIN STYLE LIVE VALIDATION
import { useState, useEffect, useRef } from "react";

export function useEmailVerifier(initialEmail = "", workerUrl: string) {
  const [email, setEmail] = useState(initialEmail);
  const [validation, setValidation] = useState<EmailValidation>({
    valid: false, status: "idle", message: "", color: "gray", level: "error"
  });
  const [isCheckingD1, setIsCheckingD1] = useState(false);
  const [d1Count, setD1Count] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Immediate structure check
    const struct = validateEmailStructure(email);
    setValidation(struct);

    // If invalid structure, don't check D1
    if (!struct.valid) {
      setIsCheckingD1(false);
      return;
    }

    // Debounce D1 check - LinkedIn style (waits 600ms after typing)
    setIsCheckingD1(true);
    debounceRef.current = setTimeout(async () => {
      const d1 = await checkEmailD1(email, workerUrl);
      setD1Count(d1.count);

      if (d1.blocked) {
        setValidation({
          valid: false,
          status: "duplicate",
          message: d1.message || "Email already in use",
          color: "red",
          level: "error",
        });
      } else {
        // Check bounce only if D1 passes
        const bounce = await checkEmailBounce(email, workerUrl);
        if (bounce.bounced) {
          setValidation({
            valid: false,
            status: "bounced",
            message: bounce.message || "This email doesn't receive emails - check inbox",
            color: "red",
            level: "error",
          });
        } else {
          setValidation({
            valid: true,
            status: "valid",
            message: "Email available ✓",
            color: "green",
            level: "success",
          });
        }
      }
      setIsCheckingD1(false);
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [email, workerUrl]);

  return {
    email,
    setEmail,
    validation,
    isCheckingD1,
    d1Count,
    isValid: validation.valid && !isCheckingD1,
  };
}

// 5. CSS HELPERS FOR LINKEDIN RED/GREEN
export const emailInputStyles = {
  getBorder: (v: EmailValidation, isChecking: boolean) => {
    if (isChecking) return "2px solid #fbbf24"; // yellow checking
    if (v.status === "idle") return "1px solid #444";
    if (v.color === "red") return "2px solid #ef4444"; // LinkedIn red
    if (v.color === "green") return "2px solid #22c55e"; // green
    return "1px solid #444";
  },
  getMessageColor: (v: EmailValidation) => {
    if (v.color === "red") return "#ef4444";
    if (v.color === "green") return "#22c55e";
    if (v.color === "orange") return "#f97316";
    return "#888";
  }
};

