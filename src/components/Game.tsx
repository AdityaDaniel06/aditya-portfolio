"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SectionTitle from "./SectionTitle";
import PixelSprite from "./PixelSprite";
import { useReveal } from "@/lib/useReveal";
import { emitCoin } from "@/lib/gsap";
import { heart } from "@/lib/sprites";
import { H, W } from "@/lib/game/constants";
import {
  canDoubleJump, comboMult, createState, draw, jump, loadArt, releaseJump, score, step,
  type GameState,
} from "@/lib/game/engine";

// "Bug Dash": an original endless runner. Jump the glitch bugs, stomp them,
// grab coins and power-ups. Rules live in src/lib/game/; this component runs
// the loop, handles input and shows the HUD. The canvas is drawn at a tiny
// internal resolution and scaled up with CSS (image-rendering: pixelated).

const BEST_KEY = "bugdash-best";

type Status = "ready" | "playing" | "paused" | "over";
type Hud = { score: number; lives: number; mult: number; star: number; magnet: number; dbl: boolean };

const emptyHud: Hud = { score: 0, lives: 0, mult: 1, star: 0, magnet: 0, dbl: false };

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}
function saveBest(n: number) {
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {
    /* storage blocked: best score just won't persist */
  }
}

const hudOf = (s: GameState): Hud => ({
  score: score(s),
  lives: s.lives,
  mult: comboMult(s),
  star: Math.ceil(s.star / 60),
  magnet: Math.ceil(s.magnet / 60),
  dbl: canDoubleJump(s),
});
const sameHud = (a: Hud, b: Hud) =>
  a.score === b.score && a.lives === b.lives && a.mult === b.mult &&
  a.star === b.star && a.magnet === b.magnet && a.dbl === b.dbl;

export default function Game() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("ready");
  const [hud, setHud] = useState<Hud>(emptyHud);
  const [best, setBest] = useState(0);
  useReveal(sectionRef);

  // Mutable game state lives in refs so the RAF loop never re-renders React.
  const g = useRef<GameState>(createState());
  const statusRef = useRef<Status>("ready");

  const setBoth = useCallback((s: Status) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const reset = useCallback(() => {
    g.current = createState();
    setHud(emptyHud);
  }, []);

  const press = useCallback(() => {
    const st = statusRef.current;
    if (st === "ready" || st === "over") {
      reset();
      setBoth("playing");
      return;
    }
    if (st === "paused") {
      setBoth("playing");
      return;
    }
    g.current.holding = true;
    jump(g.current);
  }, [reset, setBoth]);

  const release = useCallback(() => releaseJump(g.current), []);

  useEffect(() => setBest(readBest()), []);

  // Keyboard: only when the game has focus or a run is in progress.
  useEffect(() => {
    const isJumpKey = (k: string) => k === " " || k === "ArrowUp" || k === "w" || k === "W";
    const active = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return false;
      return statusRef.current === "playing" || document.activeElement === wrapRef.current;
    };
    const down = (e: KeyboardEvent) => {
      if (!isJumpKey(e.key) || !active(e)) return;
      e.preventDefault();
      if (!e.repeat) press();
    };
    const up = (e: KeyboardEvent) => {
      if (isJumpKey(e.key)) release();
      if (e.key === "Escape" && statusRef.current === "playing") setBoth("paused");
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [press, release, setBoth]);

  // Auto-pause when scrolled out of view.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && statusRef.current === "playing") setBoth("paused");
    });
    io.observe(el);
    return () => io.disconnect();
  }, [setBoth]);

  // Render + physics loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;

    const art = loadArt();
    const font = getComputedStyle(document.body).getPropertyValue("--font-press-start").trim() || "monospace";
    const shake = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastHud = emptyHud;
    let hudTick = 0;

    const events = {
      coin: (n: number) => emitCoin(n),
      over: (final: number) => {
        setHud({ ...lastHud, score: final });
        if (final > readBest()) {
          saveBest(final);
          setBest(final);
        }
        setBoth("over");
      },
    };

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(2, (now - last) / (1000 / 60));
      last = now;
      const s = g.current;
      const playing = statusRef.current === "playing";
      if (playing && !step(s, dt, events) && (hudTick += dt) >= 6) {
        hudTick = 0;
        const next = hudOf(s);
        if (!sameHud(next, lastHud)) setHud((lastHud = next));
      }
      draw(ctx, s, art, { playing, font, shake });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [setBoth]);

  const overlay: Record<Exclude<Status, "playing">, { title: string; cta: string }> = {
    ready: { title: "BUG DASH", cta: "PRESS SPACE / TAP TO START" },
    paused: { title: "PAUSED", cta: "PRESS SPACE / TAP TO RESUME" },
    over: { title: "GAME OVER", cta: "PRESS SPACE / TAP TO RETRY" },
  };

  return (
    <section id="game" ref={sectionRef} className="biome-night relative px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          level="BONUS STAGE"
          title="BUG DASH"
          light
          sub="Production is full of bugs. Jump them, stomp them, bump code blocks for coins and grab power-ups."
        />

        <div data-reveal="pop" className="px-box bg-ink! p-3">
          <div
            ref={wrapRef}
            tabIndex={0}
            role="application"
            aria-label="Bug Dash mini-game. Press Space or tap to jump."
            className="relative cursor-pointer select-none outline-none focus-visible:outline-4 focus-visible:outline-dashed focus-visible:outline-pink"
            onPointerDown={(e) => {
              e.preventDefault();
              wrapRef.current?.focus({ preventScroll: true });
              press();
            }}
            onPointerUp={release}
            onPointerLeave={release}
            style={{ touchAction: "manipulation" }}
          >
            <canvas ref={canvasRef} width={W} height={H} className="pixelated block aspect-[2/1] w-full" />

            <div className="font-pixel pointer-events-none absolute inset-x-0 top-0 p-3 text-[10px] text-cream sm:text-xs">
              <div className="flex justify-between">
                <span>SCORE {String(hud.score).padStart(5, "0")}</span>
                <span className="text-yellow">BEST {String(best).padStart(5, "0")}</span>
              </div>
              {status === "playing" && (
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] sm:text-[10px]">
                  {Array.from({ length: hud.lives }, (_, i) => (
                    <PixelSprite key={i} sprite={heart} scale={2} />
                  ))}
                  {hud.mult > 1 && <span className="text-pink">COMBO x{hud.mult}</span>}
                  {hud.star > 0 && <span className="text-yellow">★ {hud.star}s</span>}
                  {hud.magnet > 0 && <span className="text-blue">MAGNET {hud.magnet}s</span>}
                  {hud.dbl && <span className="text-green">2x JUMP</span>}
                </div>
              )}
            </div>

            {status !== "playing" && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-ink/45 text-center">
                <p className="font-pixel text-2xl text-yellow sm:text-4xl" style={{ textShadow: "4px 4px 0 #ff4f9a" }}>
                  {overlay[status].title}
                </p>
                {status === "over" && <p className="font-pixel mt-4 text-xs text-cream">SCORE {hud.score}</p>}
                <p className="font-pixel anim-blink mt-6 px-4 text-[9px] text-cream sm:text-[11px]">
                  {overlay[status].cta}
                </p>
              </div>
            )}
          </div>
        </div>
        <ul className="font-pixel mx-auto mt-6 grid max-w-3xl gap-2 text-center text-[9px] text-cream/70 sm:grid-cols-2">
          <li>SPACE / ↑ / W / TAP = JUMP · HOLD = HIGHER</li>
          <li>LAND ON BUGS TO SQUASH THEM</li>
          <li>HEAD-BUMP ORANGE BLOCKS FOR COINS</li>
          <li>10 COINS = DOUBLE JUMP · ESC = PAUSE</li>
          <li>♥ EXTRA LIFE · ★ INVINCIBLE · MAGNET PULLS COINS</li>
          <li>CHAIN COINS FOR x2 / x3 COMBOS</li>
        </ul>
      </div>
    </section>
  );
}
