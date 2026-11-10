"use client";

// One place to register GSAP plugins so every component shares the same setup.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/** Small cross-component events (coins in the HUD, opening the chat). */
export const emitCoin = (n = 1) => window.dispatchEvent(new CustomEvent("coin", { detail: n }));
export const openChat = (prompt?: string) =>
  window.dispatchEvent(new CustomEvent("chat:open", { detail: prompt }));
