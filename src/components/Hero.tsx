"use client";

import { useRef } from "react";
import PixelSprite from "./PixelSprite";
import { cloud, codeBlock, coin, flower, heroIdle } from "@/lib/sprites";
import { gsap, useGSAP, MOTION_OK, emitCoin, openChat } from "@/lib/gsap";
import { profile } from "@/data/resume";

const letterColors = ["#ff4f9a", "#ffd23f", "#2fd38a", "#4fc3ff", "#a07bff", "#ff7a3d"];

function Letters({ word, offset = 0 }: { word: string; offset?: number }) {
  return (
    <span className="inline-block whitespace-nowrap" aria-hidden>
      {word.split("").map((ch, i) => (
        <span
          key={i}
          className="hero-letter inline-block"
          style={{
            color: letterColors[(i + offset) % letterColors.length],
            textShadow: "4px 4px 0 #1b1b2f, -2px -2px 0 #1b1b2f, 2px -2px 0 #1b1b2f, -2px 2px 0 #1b1b2f",
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [firstName, ...rest] = profile.name.toUpperCase().split(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap
          .timeline({ defaults: { ease: "back.out(2)" } })
          .from(".hero-letter", { y: -160, autoAlpha: 0, stagger: 0.05, duration: 0.7, ease: "bounce.out" })
          .from(".hero-sub", { y: 24, autoAlpha: 0, stagger: 0.1 }, "-=0.3")
          .from(".hero-cta", { y: 24, autoAlpha: 0, stagger: 0.08 }, "-=0.3")
          .from(".hero-player", { x: -260, duration: 1.1, ease: "steps(10)" }, 0.3)
          .from(".hero-block", { scale: 0, stagger: 0.12 }, 0.8);

        // Clouds drift forever and parallax on scroll.
        gsap.utils.toArray<HTMLElement>(".hero-cloud").forEach((el, i) => {
          gsap.to(el, { x: i % 2 ? -60 : 60, duration: 6 + i * 2, repeat: -1, yoyo: true, ease: "sine.inOut" });
        });
        gsap.to(".hero-parallax-slow", {
          yPercent: -40,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".hero-content", {
          yPercent: 30,
          autoAlpha: 0.2,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: ref }
  );

  const hitBlock = (e: React.MouseEvent<HTMLButtonElement>) => {
    const block = e.currentTarget;
    const popped = block.querySelector(".pop-coin");
    gsap.fromTo(block, { y: 0 }, { y: -14, duration: 0.08, yoyo: true, repeat: 1, ease: "steps(2)" });
    if (popped) {
      gsap.fromTo(
        popped,
        { y: 0, autoAlpha: 1 },
        { y: -90, autoAlpha: 0, duration: 0.6, ease: "power2.out" }
      );
    }
    emitCoin();
  };

  return (
    <section id="top" ref={ref} className="biome-sky relative flex min-h-[100svh] flex-col overflow-hidden pt-14">
      {/* clouds */}
      <div className="hero-parallax-slow pointer-events-none absolute inset-0" aria-hidden>
        <PixelSprite sprite={cloud} scale={7} className="hero-cloud absolute left-[4%] top-[14%] hidden sm:block" />
        <PixelSprite sprite={cloud} scale={5} className="hero-cloud absolute right-[8%] top-[22%] hidden sm:block" />
        <PixelSprite sprite={cloud} scale={4} className="hero-cloud absolute left-[40%] top-[8%] opacity-90" />
        <PixelSprite sprite={cloud} scale={6} className="hero-cloud absolute right-[4%] top-[70%] opacity-80" />
      </div>

      <div className="hero-content relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="font-pixel text-[clamp(2rem,8vw,5.5rem)] leading-[1.15]">
          <span className="sr-only">{profile.name}</span>
          <Letters word={firstName} />
          <br />
          <Letters word={rest.join(" ")} offset={3} />
        </h1>
        <p className="hero-sub font-pixel mt-6 bg-white/70 px-3 py-2 text-[11px] sm:text-sm">
          {profile.title} · {profile.location}
        </p>
        <p className="hero-sub mt-5 max-w-xl text-xl text-ink">
          I build fast, friendly web apps with React, Next.js, Node and TypeScript.
          <br />
          Scroll to start the adventure, or hit a block to collect a coin.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-5">
          <a href="#about" className="hero-cta px-btn">▶ PRESS START</a>
          <a href="#game" className="hero-cta px-btn" style={{ background: "var(--green)" }}>
            🎮 PLAY
          </a>
          <button className="hero-cta px-btn" style={{ background: "var(--blue)" }} onClick={() => openChat()}>
            💬 ASK MY AI
          </button>
        </div>
      </div>

      {/* floating blocks */}
      <div className="relative z-10 mx-auto mb-6 flex w-full max-w-5xl items-end justify-end gap-3 px-6 sm:pr-24">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={hitBlock}
            className="hero-block relative cursor-pointer"
            aria-label="Hit the block to collect a coin"
          >
            <span className="pop-coin pointer-events-none invisible absolute left-1/2 top-0 -translate-x-1/2">
              <PixelSprite sprite={coin} scale={4} />
            </span>
            <PixelSprite sprite={codeBlock} scale={4} className={i === 1 ? "anim-bob" : ""} />
          </button>
        ))}
      </div>

      {/* ground + player */}
      <div className="relative z-10">
        <div className="mx-auto flex max-w-5xl items-end gap-6 px-6">
          <PixelSprite sprite={heroIdle} scale={6} className="hero-player" title="Pixel Aditya" />
          <PixelSprite sprite={flower} scale={5} />
          <PixelSprite sprite={flower} scale={4} className="ml-auto" />
          <PixelSprite sprite={flower} scale={5} />
        </div>
        <div className="ground" />
      </div>
    </section>
  );
}
