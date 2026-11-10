"use client";

import { useEffect } from "react";

/** Sends one anonymous visit beacon per browser tab session. Renders nothing. */
export default function VisitTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("visit-sent")) return;
      sessionStorage.setItem("visit-sent", "1");
    } catch {
      // Storage blocked (private mode etc.): still count the visit.
    }
    const payload = JSON.stringify({ path: location.pathname, referrer: document.referrer });
    const blob = new Blob([payload], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/visit", blob)) {
      void fetch("/api/visit", { method: "POST", body: payload, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
    }
  }, []);
  return null;
}
