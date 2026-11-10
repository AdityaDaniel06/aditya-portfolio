"use client";

import { useEffect, useRef, useState } from "react";
import PixelSprite from "./PixelSprite";
import { coin, heart } from "@/lib/sprites";
import { gsap } from "@/lib/gsap";
import { profile } from "@/data/resume";

const links = [
  { href: "#about", label: "Player" },
  { href: "#skills", label: "Skills" },
  { href: "#quests", label: "Quests" },
  { href: "#projects", label: "Loot" },
  { href: "#game", label: "Play" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [coins, setCoins] = useState(0);
  const [open, setOpen] = useState(false);
  const coinRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onCoin = (e: Event) => {
      setCoins((c) => c + ((e as CustomEvent<number>).detail ?? 1));
      if (coinRef.current) {
        gsap.fromTo(coinRef.current, { scale: 1.6 }, { scale: 1, duration: 0.3, ease: "steps(3)" });
      }
    };
    window.addEventListener("coin", onCoin);
    return () => window.removeEventListener("coin", onCoin);
  }, []);

  const first = profile.name.split(" ")[0].toUpperCase();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-ink/90 text-cream backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4" aria-label="Main">
        <a href="#top" className="font-pixel flex items-center gap-3 text-[11px]">
          <PixelSprite sprite={heart} scale={3} />
          <span>{first}</span>
          <span className="flex items-center gap-1 text-yellow" aria-label={`${coins} coins collected`}>
            <PixelSprite sprite={coin} scale={2} className="anim-coin" />
            <span ref={coinRef} className="inline-block">×{String(coins).padStart(2, "0")}</span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-pixel block px-3 py-2 text-[10px] transition-colors hover:bg-pink hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          className="font-pixel px-3 py-2 text-[10px] md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "✕ CLOSE" : "≡ MENU"}
        </button>
      </nav>

      {open && (
        <ul id="mobile-menu" className="grid grid-cols-2 gap-1 border-t-4 border-pink px-4 py-3 md:hidden">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-pixel block px-3 py-3 text-[10px] hover:bg-pink"
              >
                ▸ {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
