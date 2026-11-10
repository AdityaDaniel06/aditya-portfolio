"use client";

import { useRef } from "react";
import SectionTitle from "./SectionTitle";
import { useReveal } from "@/lib/useReveal";
import { gsap } from "@/lib/gsap";
import { projects } from "@/data/resume";

export default function Projects() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  // Cartridges tilt toward the cursor.
  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotateY: x * 14, rotateX: -y * 14, duration: 0.3, ease: "power2.out" });
  };
  const reset = (e: React.PointerEvent<HTMLElement>) =>
    gsap.to(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });

  return (
    <section id="projects" ref={ref} className="biome-ocean relative px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionTitle level="WORLD 3-1" title="LOOT CHEST" light sub="Side quests and builds I'm proud of." />

        <div className="grid gap-10 md:grid-cols-2" style={{ perspective: 900 }}>
          {projects.map((p, i) => (
            <article
              key={p.name}
              data-reveal="pop"
              onPointerMove={tilt}
              onPointerLeave={reset}
              className="px-box will-change-transform"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* cartridge label */}
              <div className="m-4 mb-0 p-5 text-ink" style={{ background: p.color }}>
                <p className="font-pixel text-[10px]">CARTRIDGE #{String(i + 1).padStart(2, "0")}</p>
                <h3 className="font-pixel mt-4 text-lg leading-relaxed">{p.name}</h3>
              </div>
              <div className="p-5">
                <p className="text-lg leading-snug">{p.description}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <li key={s} className="font-pixel bg-ink px-2 py-2 text-[9px] text-cream">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              {/* cartridge pins */}
              <div className="mx-8 mb-4 flex h-3 gap-1" aria-hidden>
                {Array.from({ length: 14 }).map((_, k) => (
                  <span key={k} className="flex-1 bg-[#e8b923]" />
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
