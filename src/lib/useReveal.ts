"use client";

import { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "./gsap";

/**
 * Animates every [data-reveal] element inside `scope` when it scrolls into view.
 * data-reveal="up" | "left" | "right" | "pop"  (default "up")
 * Content stays visible when the user prefers reduced motion.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
        const from = (el: HTMLElement): gsap.TweenVars => {
          switch (el.dataset.reveal) {
            case "left":
              return { x: -80, autoAlpha: 0 };
            case "right":
              return { x: 80, autoAlpha: 0 };
            case "pop":
              return { scale: 0.4, autoAlpha: 0, rotate: -6 };
            default:
              return { y: 60, autoAlpha: 0 };
          }
        };
        els.forEach((el) => gsap.set(el, from(el)));
        ScrollTrigger.batch(els, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              x: 0,
              y: 0,
              scale: 1,
              rotate: 0,
              autoAlpha: 1,
              duration: 0.7,
              ease: "back.out(1.8)",
              stagger: 0.09,
            }),
        });
      });
    },
    { scope }
  );
}
