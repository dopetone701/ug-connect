"use client";
import { useEffect, useState } from "react";

const WORKER_URL = "https://app-logo-manager-api.connectu89.workers.dev";

export function useAppLogo() {
  const [url, setUrl] = useState(WORKER_URL + "/logo.png");

  useEffect(() => {
    fetch(WORKER_URL)
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d.url) setUrl(d.url); })
      .catch(function () {});
  }, []);

  return url;
}
