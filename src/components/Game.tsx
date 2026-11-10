"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SectionTitle from "./SectionTitle";
import { useReveal } from "@/lib/useReveal";
import { emitCoin } from "@/lib/gsap";
import {
  Sprite,
  bug,
  bug2,
  cloud,
  coin,
  grassTile,
  heroIdle,
  heroJump,
  heroWalk,
  spriteSize,
  spriteToCanvas,
} from "@/lib/sprites";

// "Bug Dash": an original endless runner. Jump the glitch bugs, grab coins.
// The canvas is drawn at a tiny internal resolution and scaled up with CSS
// (image-rendering: pixelated), which keeps every pixel crisp.

const W = 320;
const H = 160;
const GROUND = H - 20; // y of the ground surface
const GRAVITY = 0.42;
const JUMP_V = -7.2;
const BEST_KEY = "bugdash-best";

type Status = "ready" | "playing" | "paused" | "over";
type Thing = { x: number; y: number; w: number; h: number; kind: "bug" | "coin"; hit?: boolean };

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

export default function Game() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  useReveal(sectionRef);

  // Mutable game state lives in a ref so the RAF loop never re-renders React.
  const g = useRef({
    status: "ready" as Status,
    y: GROUND,
    vy: 0,
    holding: false,
    speed: 2.2,
    dist: 0,
    coins: 0,
    things: [] as Thing[],
    spawnIn: 60,
    frame: 0,
    groundX: 0,
    clouds: [
      { x: 40, y: 18, s: 0.25 },
      { x: 190, y: 34, s: 0.35 },
      { x: 290, y: 12, s: 0.2 },
    ],
  });

  const setBoth = useCallback((s: Status) => {
    g.current.status = s;
    setStatus(s);
  }, []);

  const reset = useCallback(() => {
    Object.assign(g.current, {
      y: GROUND,
      vy: 0,
      speed: 2.2,
      dist: 0,
      coins: 0,
      things: [],
      spawnIn: 60,
      frame: 0,
    });
    setScore(0);
  }, []);

  const press = useCallback(() => {
    const s = g.current;
    if (s.status === "ready" || s.status === "over") {
      reset();
      setBoth("playing");
      return;
    }
    if (s.status === "paused") {
      setBoth("playing");
      return;
    }
    s.holding = true;
    if (s.y >= GROUND) s.vy = JUMP_V;
  }, [reset, setBoth]);

  const release = useCallback(() => {
    const s = g.current;
    s.holding = false;
    if (s.vy < -3) s.vy = -3; // short hop when the button is tapped
  }, []);

  useEffect(() => setBest(readBest()), []);

  // Keyboard: only when the game has focus or a run is in progress.
  useEffect(() => {
    const isJumpKey = (k: string) => k === " " || k === "ArrowUp" || k === "w" || k === "W";
    const active = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return false;
      return g.current.status === "playing" || document.activeElement === wrapRef.current;
    };
    const down = (e: KeyboardEvent) => {
      if (!isJumpKey(e.key) || !active(e)) return;
      e.preventDefault();
      if (!e.repeat) press();
    };
    const up = (e: KeyboardEvent) => {
      if (isJumpKey(e.key)) release();
      if (e.key === "Escape" && g.current.status === "playing") setBoth("paused");
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
      if (!entry.isIntersecting && g.current.status === "playing") setBoth("paused");
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

    const img = (s: Sprite) => spriteToCanvas(s, 1);
    const art = {
      idle: img(heroIdle),
      walk: img(heroWalk),
      jump: img(heroJump),
      bug: img(bug),
      bug2: img(bug2),
      coin: img(coin),
      cloud: img(cloud),
      grass: img(grassTile),
    };
    const hero = spriteSize(heroIdle);
    const stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * (GROUND - 30),
      t: Math.random() * 100,
    }));

    let raf = 0;
    let last = performance.now();

    const step = (dt: number) => {
      const s = g.current;
      s.frame += dt;
      s.speed = Math.min(5.5, s.speed + 0.0009 * dt);
      s.dist += s.speed * dt;

      // player physics (holding the button = floatier jump)
      s.vy += (s.holding && s.vy < 0 ? GRAVITY * 0.6 : GRAVITY) * dt;
      s.y = Math.min(GROUND, s.y + s.vy * dt);
      if (s.y >= GROUND) s.vy = 0;

      // spawn
      s.spawnIn -= dt;
      if (s.spawnIn <= 0) {
        const roll = Math.random();
        if (roll < 0.65) {
          s.things.push({ x: W + 10, y: GROUND - 10, w: 10, h: 10, kind: "bug" });
        } else {
          const n = 3 + Math.floor(Math.random() * 3);
          const y = GROUND - 30 - Math.random() * 30;
          for (let i = 0; i < n; i++) s.things.push({ x: W + 10 + i * 14, y, w: 8, h: 8, kind: "coin" });
        }
        s.spawnIn = (55 + Math.random() * 70) * (2.4 / s.speed) + 18;
      }

      // move + collide
      const px = 40 + 2;
      const py = s.y - hero.h + 2;
      const pw = hero.w - 4;
      const ph = hero.h - 3;
      for (const t of s.things) {
        t.x -= s.speed * dt;
        if (t.hit) continue;
        const overlap = px < t.x + t.w - 2 && px + pw > t.x + 2 && py < t.y + t.h && py + ph > t.y + 2;
        if (!overlap) continue;
        if (t.kind === "coin") {
          t.hit = true;
          s.coins++;
          emitCoin();
        } else {
          const final = Math.floor(s.dist / 10) + s.coins * 10;
          setScore(final);
          if (final > readBest()) {
            saveBest(final);
            setBest(final);
          }
          setBoth("over");
          return;
        }
      }
      s.things = s.things.filter((t) => t.x > -20 && !t.hit);
      for (const c of s.clouds) {
        c.x -= s.speed * c.s * dt;
        if (c.x < -20) c.x = W + Math.random() * 60;
      }
      s.groundX = (s.groundX + s.speed * dt) % 12;
      if (Math.floor(s.frame) % 6 === 0) setScore(Math.floor(s.dist / 10) + s.coins * 10);
    };

    const draw = () => {
      const s = g.current;
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, "#0d0b2b");
      grd.addColorStop(1, "#5b3fb0");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      for (const st of stars) {
        ctx.fillStyle = Math.sin((s.frame + st.t) / 12) > 0 ? "#fff6e0" : "#7b6bd6";
        ctx.fillRect(Math.floor(st.x), Math.floor(st.y), 1, 1);
      }
      // moon
      ctx.fillStyle = "#ffd23f";
      ctx.fillRect(266, 14, 18, 18);
      ctx.fillStyle = "#0d0b2b";
      ctx.fillRect(274, 14, 10, 8);

      ctx.globalAlpha = 0.35;
      for (const c of s.clouds) ctx.drawImage(art.cloud, Math.floor(c.x), c.y);
      ctx.globalAlpha = 1;

      for (let x = -Math.floor(s.groundX); x < W; x += 12) ctx.drawImage(art.grass, x, GROUND);
      ctx.fillStyle = "#8a4a1e";
      ctx.fillRect(0, GROUND + 8, W, H - GROUND - 8);

      const flap = Math.floor(s.frame / 8) % 2 === 0;
      for (const t of s.things) {
        if (t.kind === "bug") ctx.drawImage(flap ? art.bug : art.bug2, Math.floor(t.x), Math.floor(t.y));
        else {
          const bob = Math.sin((s.frame + t.x) / 6) > 0 ? 0 : 1;
          ctx.drawImage(art.coin, Math.floor(t.x), Math.floor(t.y) + bob);
        }
      }

      const sprite =
        s.y < GROUND ? art.jump : s.status === "playing" && Math.floor(s.frame / 6) % 2 ? art.walk : art.idle;
      ctx.drawImage(sprite, 40, Math.floor(s.y - hero.h));
    };

    const loop = (now: number) => {
      const dt = Math.min(2, (now - last) / (1000 / 60));
      last = now;
      if (g.current.status === "playing") step(dt);
      draw();
      raf = requestAnimationFrame(loop);
    };
    draw(); // paint the first frame immediately
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
          sub="Production is full of bugs. Jump over them and grab every coin. Hold to jump higher."
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
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="pixelated block aspect-[2/1] w-full"
            />

            <div className="font-pixel pointer-events-none absolute inset-x-0 top-0 flex justify-between p-3 text-[10px] text-cream sm:text-xs">
              <span>SCORE {String(score).padStart(5, "0")}</span>
              <span className="text-yellow">BEST {String(best).padStart(5, "0")}</span>
            </div>

            {status !== "playing" && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-ink/45 text-center">
                <p
                  className="font-pixel text-2xl text-yellow sm:text-4xl"
                  style={{ textShadow: "4px 4px 0 #ff4f9a" }}
                >
                  {overlay[status].title}
                </p>
                {status === "over" && (
                  <p className="font-pixel mt-4 text-xs text-cream">SCORE {score}</p>
                )}
                <p className="font-pixel anim-blink mt-6 px-4 text-[9px] text-cream sm:text-[11px]">
                  {overlay[status].cta}
                </p>
              </div>
            )}
          </div>
        </div>
        <p className="font-pixel mt-6 text-center text-[9px] text-cream/70">
          SPACE / ↑ / W = JUMP · ESC = PAUSE · COINS ALSO COUNT IN THE TOP BAR
        </p>
      </div>
    </section>
  );
}
