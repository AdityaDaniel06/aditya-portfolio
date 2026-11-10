"use client";

import { useRef } from "react";
import PixelSprite from "./PixelSprite";
import SectionTitle from "./SectionTitle";
import { heroIdle, star, trophy } from "@/lib/sprites";
import { useReveal } from "@/lib/useReveal";
import { achievements, education, profile } from "@/data/resume";

const stats = [
  { label: "LOAD TIME", value: "−25%", note: "via code splitting & lazy loading", color: "#ff4f9a" },
  { label: "ERROR RATE", value: "<10%", note: "on multi-module Angular/React apps", color: "#2fd38a" },
  { label: "GUILDS", value: "2", note: "TCS · Netlink / Lumenore AI", color: "#4fc3ff" },
  { label: "TITLE", value: "★", note: "Star Performer, Q1 & Q2", color: "#ffd23f" },
];

export default function About() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section id="about" ref={ref} className="biome-meadow relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle level="WORLD 1-1" title="PLAYER PROFILE" />

        <div className="grid items-start gap-8 lg:grid-cols-[320px_1fr]">
          {/* character card */}
          <div data-reveal="left" className="px-box p-6 text-center">
            <div className="mx-auto flex h-48 items-center justify-center bg-[var(--sky-bottom)]">
              <PixelSprite sprite={heroIdle} scale={9} className="anim-bob" title="Pixel Aditya" />
            </div>
            <p className="font-pixel mt-5 text-sm">{profile.name.toUpperCase()}</p>
            <p className="mt-1 text-lg">Class: {profile.title}</p>
            <div className="mt-4 space-y-2 text-left">
              {[
                ["FRONT-END", 95, "#ff4f9a"],
                ["BACK-END", 80, "#2fd38a"],
                ["TESTING", 85, "#4fc3ff"],
              ].map(([k, v, c]) => (
                <div key={k as string}>
                  <div className="font-pixel flex justify-between text-[9px]">
                    <span>{k}</span>
                  </div>
                  <div className="mt-1 h-4 bg-ink p-[3px]">
                    <div className="h-full" style={{ width: `${v}%`, background: c as string }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div data-reveal="right" className="px-box p-6 sm:p-8">
              <p className="font-pixel mb-4 text-[11px] text-pink">▸ BIO.TXT</p>
              <p className="text-xl leading-relaxed">{profile.summary}</p>
              <p className="mt-4 text-xl leading-relaxed">
                Today I architect AI-powered front-ends for US clients at Lumenore AI. I prototype the flows,
                build the UI, shape the data with the DBA and cover it all with Playwright tests.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} data-reveal="pop" className="px-box p-4 text-center">
                  <p className="font-pixel text-2xl" style={{ color: s.color, textShadow: "2px 2px 0 #1b1b2f" }}>
                    {s.value}
                  </p>
                  <p className="font-pixel mt-3 text-[9px]">{s.label}</p>
                  <p className="mt-2 text-sm leading-tight text-ink/75">{s.note}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div data-reveal className="px-box flex items-center gap-4 p-5">
                <PixelSprite sprite={star} scale={5} className="anim-bob shrink-0" />
                <div>
                  <p className="font-pixel text-[10px]">SAVE FILE: EDUCATION</p>
                  <p className="mt-2 text-lg leading-tight">{education.degree}</p>
                  <p className="text-ink/75">
                    {education.school} · {education.period}
                  </p>
                </div>
              </div>
              {achievements.map((a) => (
                <div key={a.title} data-reveal className="px-box flex items-center gap-4 p-5">
                  <PixelSprite sprite={trophy} scale={5} className="anim-bob shrink-0" />
                  <div>
                    <p className="font-pixel text-[10px]">ACHIEVEMENT UNLOCKED</p>
                    <p className="mt-2 text-lg leading-tight">{a.title}</p>
                    <p className="text-ink/75">
                      {a.detail} · {a.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
