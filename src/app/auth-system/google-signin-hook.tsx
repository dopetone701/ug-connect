"use client";
import { useEffect, useState, useCallback } from "react";

const WORKER_URL = "https://google-signin-api.connectu89.workers.dev";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

declare global { interface Window { google?: any } }

export default function useGoogleSigninHook() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document.getElementById("google-gsi")) { setReady(true); return; }
    const s = document.createElement("script");
    s.id = "google-gsi";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);

  const handleGoogleResponse = useCallback(async (credential: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google login failed");

      localStorage.setItem("ug_token", data.token);
      localStorage.setItem("ug_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("ug-auth-changed"));
      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const renderGoogleButton = useCallback((elementId: string) => {
    if (!window.google || !ready || !CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response: any) => {
        handleGoogleResponse(response.credential)
          .then(user => {
            // trigger success callback via custom event
            window.dispatchEvent(new CustomEvent("google-login-success", { detail: user }));
          })
          .catch(e => alert(e.message));
      },
    });
    const el = document.getElementById(elementId);
    if (el) {
      el.innerHTML = "";
      window.google.accounts.id.renderButton(el, {
        theme: "outline",
        size: "large",
        width: 340,
        text: "continue_with",
        shape: "pill"
      });
    }
  }, [ready, handleGoogleResponse]);

  return { ready, loading, renderGoogleButton, handleGoogleResponse };
}
