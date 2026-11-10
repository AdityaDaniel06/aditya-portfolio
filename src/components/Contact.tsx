"use client";

import { useRef, useState } from "react";
import SectionTitle from "./SectionTitle";
import ContactForm from "./ContactForm";
import PixelSprite from "./PixelSprite";
import { heroJump, heart, coin, trophy } from "@/lib/sprites";
import { useReveal } from "@/lib/useReveal";
import { openChat } from "@/lib/gsap";
import { profile } from "@/data/resume";

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const [formOpen, setFormOpen] = useState(false);

  const channels = [
    { label: "EMAIL", value: profile.email, href: `mailto:${profile.email}`, color: "#ff4f9a" },
    { label: "LINKEDIN", value: profile.linkedin.replace(/^https?:\/\//, ""), href: profile.linkedin, color: "#4fc3ff" },
    { label: "GITHUB", value: profile.github.replace(/^https?:\/\//, ""), href: profile.github, color: "#a07bff" },
  ];

  return (
    <section id="contact" ref={ref} className="biome-candy relative overflow-hidden px-4 pb-0 pt-24">
      <div className="mx-auto max-w-4xl">
        <SectionTitle level="FINAL STAGE" title="CONTINUE?" sub="Got a quest for me? Insert coin and let's build something." />

        <div data-reveal="pop" className="px-box p-6 sm:p-10">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <PixelSprite sprite={heroJump} scale={7} className="anim-bob shrink-0" title="Pixel Aditya jumping" />
            <div>
              <p className="font-pixel text-sm leading-relaxed sm:text-base">PLAYER 2, PRESS START!</p>
              <p className="mt-3 text-xl">
                Open to full-stack and front-end roles, freelance builds and interesting collaborations.
              </p>
            </div>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {channels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group flex items-center gap-3 bg-white p-4 shadow-[0_0_0_3px_#1b1b2f] transition-transform hover:-translate-y-1"
                >
                  <span className="font-pixel shrink-0 px-2 py-2 text-[9px] text-ink" style={{ background: c.color }}>
                    {c.label}
                  </span>
                  <span className="truncate text-lg group-hover:underline">{c.value}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap justify-center gap-5">
            <button
              className="px-btn"
              aria-expanded={formOpen}
              aria-controls="contact-form"
              onClick={() => setFormOpen((o) => !o)}
            >
              ✉ SEND A MESSAGE
            </button>
            <button className="px-btn" style={{ background: "var(--blue)" }} onClick={() => openChat()}>
              💬 ASK THE AI FIRST
            </button>
          </div>

          {formOpen && (
            <div id="contact-form" className="relative mt-8">
              <ContactForm />
            </div>
          )}
        </div>
      </div>

      <footer className="mt-20">
        <div className="mx-auto flex max-w-5xl items-end justify-between px-6">
          <PixelSprite sprite={trophy} scale={5} />
          <div className="flex gap-3 pb-1">
            <PixelSprite sprite={heart} scale={4} />
            <PixelSprite sprite={heart} scale={4} />
            <PixelSprite sprite={heart} scale={4} />
          </div>
          <PixelSprite sprite={coin} scale={5} className="anim-coin" />
        </div>
        <div className="ground flex items-end justify-center pb-2">
          <p className="font-pixel text-center text-[9px] text-cream">
            © {new Date().getFullYear()} {profile.name.toUpperCase()} · MADE WITH NEXT.JS, GSAP & PIXELS
          </p>
        </div>
      </footer>
    </section>
  );
}
