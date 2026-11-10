"use client";

import { useRef } from "react";
import SectionTitle from "./SectionTitle";
import PixelSprite from "./PixelSprite";
import { star } from "@/lib/sprites";
import { useReveal } from "@/lib/useReveal";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { experience } from "@/data/resume";

export default function Experience() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  // The dotted path "draws" itself as you scroll.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ".quest-path",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: ".quest-list", start: "top 70%", end: "bottom 60%", scrub: true },
          }
        );
      });
    },
    { scope: ref }
  );

  return (
    <section id="quests" ref={ref} className="biome-sunset relative px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionTitle level="WORLD 2-1" title="QUEST LOG" light sub="Every level I've cleared so far, newest first." />

        <div className="quest-list relative">
          <div
            className="quest-path absolute bottom-0 left-5 top-0 w-2 origin-top md:left-1/2 md:-translate-x-1/2"
            style={{ background: "repeating-linear-gradient(#fff6e0 0 12px, transparent 12px 24px)" }}
            aria-hidden
          />

          <ol className="space-y-14">
            {experience.map((job, i) => (
              <li
                key={job.company}
                className={`relative pl-14 md:w-1/2 md:pl-0 ${i % 2 ? "md:ml-auto md:pl-12" : "md:pr-12"}`}
              >
                <span
                  className={`absolute left-0 top-2 md:top-4 ${i % 2 ? "md:-left-5" : "md:left-auto md:-right-5"}`}
                  aria-hidden
                >
                  <PixelSprite sprite={star} scale={5} className="anim-bob" />
                </span>

                <article data-reveal={i % 2 ? "right" : "left"} className="px-box overflow-hidden">
                  <header className="px-5 py-4 text-ink" style={{ background: job.color }}>
                    <p className="font-pixel text-[10px]">
                      {job.world} · {job.period}
                    </p>
                    <h3 className="font-pixel mt-3 text-sm leading-relaxed">{job.company}</h3>
                    <p className="mt-1 text-lg">{job.role}</p>
                  </header>
                  <ul className="space-y-3 p-5">
                    {job.points.map((p) => (
                      <li key={p} className="flex gap-3 text-lg leading-snug">
                        <span className="mt-1 text-pink" aria-hidden>▸</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
