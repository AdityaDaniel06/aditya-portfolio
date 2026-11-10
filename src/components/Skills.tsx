"use client";

import { useRef } from "react";
import SectionTitle from "./SectionTitle";
import { useReveal } from "@/lib/useReveal";
import { skills } from "@/data/resume";

export default function Skills() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section id="skills" ref={ref} className="biome-cave relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          level="WORLD 1-2"
          title="POWER-UPS"
          light
          sub="Everything in my inventory. Hover a power-up to make it bounce."
        />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((g) => (
            <div key={g.group} data-reveal="pop" className="px-box overflow-hidden">
              <div className="font-pixel flex items-center justify-between px-5 py-3 text-[11px] text-ink" style={{ background: g.color }}>
                <span>{g.group.toUpperCase()}</span>
                <span>LV.{g.items.length}</span>
              </div>
              <ul className="flex flex-wrap gap-3 p-5">
                {g.items.map((item) => (
                  <li
                    key={item}
                    className="skill-chip cursor-default bg-white px-3 py-1 text-lg"
                    style={{ boxShadow: `0 4px 0 ${g.color}, 0 0 0 3px #1b1b2f` }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* scrolling marquee of all skills */}
        <div className="mt-16 overflow-hidden border-y-4 border-yellow bg-ink py-4" aria-hidden>
          <div className="anim-marquee font-pixel flex w-max gap-10 whitespace-nowrap text-sm text-yellow">
            {[0, 1].map((k) => (
              <span key={k} className="flex gap-10">
                {skills.flatMap((g) => g.items).map((s) => (
                  <span key={s + k}>★ {s}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
