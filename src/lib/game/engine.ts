// Bug Dash game logic and rendering. Framework-free: Game.tsx owns the loop
// and input, this file owns the rules.
import { bug, bug2, cloud, codeBlock, coin, grassTile, heart, heroIdle, heroJump, heroWalk, spriteSize, spriteToCanvas, star } from "@/lib/sprites";
import {
  COMBO_WINDOW, DOUBLE_JUMP_AT, DOUBLE_JUMP_V, GRAVITY, GROUND, H, HERO_X, HURT_INVULN, JUMP_V,
  MAGNET_TIME, MAX_LIVES, MAX_SPEED, START_SPEED, STAR_TIME, STOMP_BOUNCE, W,
} from "./constants";
import { spawnPattern } from "./patterns";
import { fly, fly2, gem, heroRainbow, magnet, spike, stoneBlock, usedBlock } from "./sprites";

export type Kind = "bug" | "fly" | "spike" | "coin" | "gem" | "block" | "heart" | "star" | "magnet";

export type Thing = {
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  baseY?: number; // hover centre for flyers and power-ups
  phase?: number;
  coin?: boolean; // block hides a coin
  used?: boolean; // block's coin already taken
  bump?: number; // block bounce timer
  dead?: boolean;
};

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };
type Popup = { x: number; y: number; text: string; life: number; color: string };
type CoinPop = { x: number; y: number; vy: number; life: number };

export type GameState = ReturnType<typeof createState>;

export const HERO = spriteSize(heroIdle);

export function createState() {
  return {
    y: GROUND,
    vy: 0,
    grounded: true,
    usedDouble: false,
    holding: false,
    speed: START_SPEED,
    dist: 0,
    nextAt: 60,
    points: 0,
    coins: 0,
    lives: 0,
    combo: 0,
    comboTimer: 0,
    star: 0,
    magnet: 0,
    invuln: 0,
    shake: 0,
    frame: 0,
    groundX: 0,
    things: [] as Thing[],
    particles: [] as Particle[],
    popups: [] as Popup[],
    coinPops: [] as CoinPop[],
    toast: null as { text: string; life: number } | null,
    clouds: [
      { x: 40, y: 18, s: 0.25 },
      { x: 190, y: 34, s: 0.35 },
      { x: 290, y: 12, s: 0.2 },
    ],
  };
}

export const score = (s: GameState) => Math.floor(s.dist / 10) + s.points;
export const comboMult = (s: GameState) => (s.combo >= 10 ? 3 : s.combo >= 5 ? 2 : 1);
export const canDoubleJump = (s: GameState) => s.coins >= DOUBLE_JUMP_AT;

export type Events = { coin: (n: number) => void; over: (finalScore: number) => void };

// ── helpers ──────────────────────────────────────────────────

function burst(s: GameState, x: number, y: number, color: string, n: number, force = 1.5) {
  for (let i = 0; i < n; i++) {
    s.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 2 * force,
      vy: -Math.random() * 1.6 * force,
      life: 18 + Math.random() * 12,
      color,
      size: Math.random() < 0.3 ? 2 : 1,
    });
  }
}

const popup = (s: GameState, x: number, y: number, text: string, color = "#fff6e0") =>
  s.popups.push({ x, y, text, life: 40, color });

const toast = (s: GameState, text: string) => (s.toast = { text, life: 100 });

function collect(s: GameState, x: number, y: number, isGem: boolean, ev: Events) {
  const before = comboMult(s);
  s.combo++;
  s.comboTimer = COMBO_WINDOW;
  const mult = comboMult(s);
  const pts = (isGem ? 50 : 10) * mult;
  s.points += pts;
  s.coins++;
  ev.coin(isGem ? 5 : 1);
  popup(s, x, y, `+${pts}`, isGem ? "#4fc3ff" : "#ffd23f");
  burst(s, x, y, isGem ? "#e8fbff" : "#fff7c2", isGem ? 10 : 4, 1);
  if (s.coins === DOUBLE_JUMP_AT) toast(s, "DOUBLE JUMP!");
  else if (mult > before) toast(s, `COMBO x${mult}`);
}

function squash(s: GameState, t: Thing, pts: number) {
  t.dead = true;
  s.points += pts;
  popup(s, t.x + t.w / 2, t.y - 4, `+${pts}`);
  burst(s, t.x + t.w / 2, t.y + t.h / 2, t.kind === "fly" ? "#ff7a3d" : "#7b5cff", 10, 1.8);
}

/** Returns true when the run is over. */
function hurt(s: GameState, ev: Events) {
  if (s.invuln > 0) return false;
  s.shake = 12;
  burst(s, HERO_X + HERO.w / 2, s.y - HERO.h / 2, "#ff4f9a", 14, 2);
  if (s.lives > 0) {
    s.lives--;
    s.invuln = HURT_INVULN;
    popup(s, HERO_X + HERO.w / 2, s.y - HERO.h - 6, "OUCH!", "#ff4f9a");
    return false;
  }
  ev.over(score(s));
  return true;
}

// ── input ────────────────────────────────────────────────────

export function jump(s: GameState) {
  if (s.grounded) {
    s.vy = JUMP_V;
    s.grounded = false;
  } else if (canDoubleJump(s) && !s.usedDouble) {
    s.vy = DOUBLE_JUMP_V;
    s.usedDouble = true;
    burst(s, HERO_X + HERO.w / 2, s.y, "#fff6e0", 6, 1);
  }
}

export function releaseJump(s: GameState) {
  s.holding = false;
  if (s.vy < -3) s.vy = -3; // short hop when the button is tapped
}

// ── simulation ───────────────────────────────────────────────

/** Advances one tick. Returns true when the run ended this tick. */
export function step(s: GameState, dt: number, ev: Events): boolean {
  s.frame += dt;
  s.speed = Math.min(MAX_SPEED, s.speed + 0.0009 * dt);
  s.dist += s.speed * dt;
  s.star = Math.max(0, s.star - dt);
  s.magnet = Math.max(0, s.magnet - dt);
  s.invuln = Math.max(0, s.invuln - dt);
  s.shake = Math.max(0, s.shake - dt);
  s.comboTimer -= dt;
  if (s.comboTimer <= 0) s.combo = 0;

  // spawn the next level chunk
  if (s.dist >= s.nextAt) {
    const len = spawnPattern(s, W + 16);
    const gap = (60 + Math.random() * 90) * Math.pow(s.speed / START_SPEED, 0.7);
    s.nextAt = s.dist + len + gap;
  }

  // move the world
  const heroCx = HERO_X + HERO.w / 2;
  const heroCy = s.y - HERO.h / 2;
  for (const t of s.things) {
    t.x -= s.speed * dt;
    if (t.bump) t.bump = Math.max(0, t.bump - dt);
    if (t.baseY !== undefined) {
      const amp = t.kind === "fly" ? 4 : 2;
      t.y = t.baseY + Math.sin((s.frame + (t.phase ?? t.x)) / 14) * amp;
    }
    if (s.magnet > 0 && (t.kind === "coin" || t.kind === "gem")) {
      const dx = heroCx - (t.x + t.w / 2);
      const dy = heroCy - (t.y + t.h / 2);
      const d = Math.hypot(dx, dy);
      if (d < 90 && d > 0.1) {
        t.x += (dx / d) * 5 * dt;
        t.y += (dy / d) * 5 * dt;
      }
    }
  }

  // player physics (holding the button = floatier jump)
  const prevY = s.y;
  const prevTop = s.y - HERO.h;
  s.vy += (s.holding && s.vy < 0 ? GRAVITY * 0.6 : GRAVITY) * dt;
  s.y += s.vy * dt;
  if (s.y - HERO.h < 0) {
    s.y = HERO.h;
    s.vy = Math.max(s.vy, 0);
  }

  let landed = false;
  const left = HERO_X + 2;
  const right = HERO_X + HERO.w - 2;
  for (const b of s.things) {
    if (b.kind !== "block" || right <= b.x || left >= b.x + b.w) continue;
    if (s.vy >= 0 && prevY <= b.y + 0.5 && s.y >= b.y) {
      s.y = b.y;
      landed = true;
    } else if (s.vy < 0 && prevTop >= b.y + b.h - 0.5 && s.y - HERO.h < b.y + b.h) {
      // head bonk from below
      s.y = b.y + b.h + HERO.h;
      s.vy = 0.5;
      b.bump = 8;
      if (b.coin && !b.used) {
        b.used = true;
        s.coinPops.push({ x: b.x + 2, y: b.y - 8, vy: -3, life: 22 });
        collect(s, b.x + b.w / 2, b.y - 10, false, ev);
      }
    }
  }
  if (s.y >= GROUND) {
    s.y = GROUND;
    landed = true;
  }
  if (landed) {
    if (!s.grounded && s.vy > 3) burst(s, heroCx, s.y, "#c97b40", 5, 0.8);
    s.vy = 0;
    s.grounded = true;
    s.usedDouble = false;
  } else {
    s.grounded = false;
  }

  // touch things
  const px = HERO_X + 2;
  const py = s.y - HERO.h + 2;
  const pw = HERO.w - 4;
  const ph = HERO.h - 3;
  for (const t of s.things) {
    if (t.dead || t.kind === "block") continue;
    const hit = px < t.x + t.w - 1 && px + pw > t.x + 1 && py < t.y + t.h - 1 && py + ph > t.y + 1;
    if (!hit) continue;
    switch (t.kind) {
      case "coin":
      case "gem":
        t.dead = true;
        collect(s, t.x + t.w / 2, t.y, t.kind === "gem", ev);
        break;
      case "heart":
        t.dead = true;
        if (s.lives < MAX_LIVES) {
          s.lives++;
          toast(s, "+1 LIFE");
        } else {
          s.points += 100;
          popup(s, t.x, t.y, "+100");
        }
        break;
      case "star":
        t.dead = true;
        s.star = STAR_TIME;
        toast(s, "INVINCIBLE!");
        break;
      case "magnet":
        t.dead = true;
        s.magnet = MAGNET_TIME;
        toast(s, "COIN MAGNET!");
        break;
      case "bug":
      case "fly":
        if (s.star > 0) {
          squash(s, t, 50);
        } else if (s.vy > 0 && prevY <= t.y + 5) {
          squash(s, t, 25);
          s.vy = s.holding ? STOMP_BOUNCE * 1.4 : STOMP_BOUNCE;
          s.usedDouble = false;
        } else if (hurt(s, ev)) {
          return true;
        }
        break;
      case "spike":
        if (s.star <= 0 && hurt(s, ev)) return true;
        break;
    }
  }

  // tidy up + effects
  s.things = s.things.filter((t) => !t.dead && t.x > -40);
  for (const p of s.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 0.15 * dt;
    p.life -= dt;
  }
  s.particles = s.particles.filter((p) => p.life > 0);
  for (const p of s.popups) {
    p.y -= 0.5 * dt;
    p.life -= dt;
  }
  s.popups = s.popups.filter((p) => p.life > 0);
  for (const c of s.coinPops) {
    c.y += c.vy * dt;
    c.vy += 0.3 * dt;
    c.life -= dt;
  }
  s.coinPops = s.coinPops.filter((c) => c.life > 0);
  if (s.toast && (s.toast.life -= dt) <= 0) s.toast = null;
  if (s.star > 0 && Math.random() < 0.4 * dt) {
    burst(s, HERO_X + Math.random() * HERO.w, s.y - Math.random() * HERO.h, "#ffd23f", 1, 0.5);
  }

  for (const c of s.clouds) {
    c.x -= s.speed * c.s * dt;
    if (c.x < -20) c.x = W + Math.random() * 60;
  }
  s.groundX = (s.groundX + s.speed * dt) % 12;
  return false;
}

// ── rendering ────────────────────────────────────────────────

export function loadArt() {
  const img = (sp: Parameters<typeof spriteToCanvas>[0]) => spriteToCanvas(sp, 1);
  return {
    idle: img(heroIdle),
    walk: img(heroWalk),
    jump: img(heroJump),
    rainbow: heroRainbow.map((r) => ({ idle: img(r.idle), walk: img(r.walk), jump: img(r.jump) })),
    bug: img(bug),
    bug2: img(bug2),
    fly: img(fly),
    fly2: img(fly2),
    coin: img(coin),
    gem: img(gem),
    heart: img(heart),
    star: img(star),
    magnet: img(magnet),
    spike: img(spike),
    codeBlock: img(codeBlock),
    stoneBlock: img(stoneBlock),
    usedBlock: img(usedBlock),
    cloud: img(cloud),
    grass: img(grassTile),
    stars: Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * (GROUND - 30),
      t: Math.random() * 100,
    })),
  };
}
export type Art = ReturnType<typeof loadArt>;

export function draw(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  art: Art,
  opts: { playing: boolean; font: string; shake: boolean },
) {
  ctx.save();
  if (opts.shake && s.shake > 0) {
    ctx.translate(Math.round((Math.random() - 0.5) * 4), Math.round((Math.random() - 0.5) * 4));
  }

  // sky
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, "#0d0b2b");
  grd.addColorStop(1, "#5b3fb0");
  ctx.fillStyle = grd;
  ctx.fillRect(-4, -4, W + 8, H + 8);
  for (const st of art.stars) {
    ctx.fillStyle = Math.sin((s.frame + st.t) / 12) > 0 ? "#fff6e0" : "#7b6bd6";
    ctx.fillRect(Math.floor(st.x), Math.floor(st.y), 1, 1);
  }
  ctx.fillStyle = "#ffd23f";
  ctx.fillRect(266, 14, 18, 18);
  ctx.fillStyle = "#0d0b2b";
  ctx.fillRect(274, 14, 10, 8);
  ctx.globalAlpha = 0.35;
  for (const c of s.clouds) ctx.drawImage(art.cloud, Math.floor(c.x), c.y);
  ctx.globalAlpha = 1;

  // ground
  for (let x = -Math.floor(s.groundX); x < W; x += 12) ctx.drawImage(art.grass, x, GROUND);
  ctx.fillStyle = "#8a4a1e";
  ctx.fillRect(0, GROUND + 8, W, H - GROUND - 8);

  // things
  const flap = Math.floor(s.frame / 8) % 2 === 0;
  for (const t of s.things) {
    const x = Math.floor(t.x);
    const y = Math.floor(t.y);
    switch (t.kind) {
      case "block": {
        const lift = t.bump ? Math.round(Math.sin(((8 - t.bump) / 8) * Math.PI) * 3) : 0;
        const sp = t.used ? art.usedBlock : t.coin ? art.codeBlock : art.stoneBlock;
        ctx.drawImage(sp, x, y - lift);
        break;
      }
      case "bug":
        ctx.drawImage(flap ? art.bug : art.bug2, x, y);
        break;
      case "fly":
        ctx.drawImage(Math.floor(s.frame / 5) % 2 ? art.fly : art.fly2, x, y);
        break;
      case "spike":
        for (let i = 0; i < t.w; i += 8) ctx.drawImage(art.spike, x + i, y);
        break;
      case "coin":
      case "gem": {
        const bob = Math.sin((s.frame + t.x) / 6) > 0 ? 0 : 1;
        ctx.drawImage(t.kind === "gem" ? art.gem : art.coin, x, y + bob);
        if (t.kind === "gem" && Math.floor(s.frame / 10) % 3 === 0) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x + 7, y - 1, 1, 1);
        }
        break;
      }
      case "heart":
      case "star":
      case "magnet": {
        // soft glow so power-ups stand out
        ctx.fillStyle = Math.floor(s.frame / 8) % 2 ? "rgba(255,246,224,0.25)" : "rgba(255,246,224,0.12)";
        ctx.fillRect(x - 2, y - 2, t.w + 4, t.h + 4);
        ctx.drawImage(art[t.kind], x, y);
        break;
      }
    }
  }

  for (const c of s.coinPops) ctx.drawImage(art.coin, Math.floor(c.x), Math.floor(c.y));
  for (const p of s.particles) {
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
  }

  // hero (blinks while invulnerable after a hit, rainbow while starred)
  const blink = s.invuln > 0 && Math.floor(s.frame / 4) % 2 === 0;
  if (!blink) {
    const starred = s.star > 60 || (s.star > 0 && Math.floor(s.frame / 6) % 2 === 0);
    const set = starred ? art.rainbow[Math.floor(s.frame / 4) % art.rainbow.length] : art;
    const pose = !s.grounded ? set.jump : opts.playing && Math.floor(s.frame / 6) % 2 ? set.walk : set.idle;
    ctx.drawImage(pose, HERO_X, Math.floor(s.y - HERO.h));
  }
  if (s.magnet > 0 && (s.magnet > 60 || Math.floor(s.frame / 6) % 2 === 0)) {
    ctx.drawImage(art.magnet, HERO_X + 2, Math.floor(s.y - HERO.h) - 10);
  }

  // text
  ctx.font = `8px ${opts.font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (const p of s.popups) {
    ctx.globalAlpha = Math.min(1, p.life / 15);
    ctx.fillStyle = "#1b1b2f";
    ctx.fillText(p.text, Math.floor(p.x) + 1, Math.floor(p.y) + 1);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, Math.floor(p.x), Math.floor(p.y));
  }
  ctx.globalAlpha = 1;
  if (s.toast) {
    const y = 34 - Math.max(0, s.toast.life - 90) * 2; // slide in
    ctx.fillStyle = "#ff4f9a";
    ctx.fillText(s.toast.text, W / 2 + 1, y + 1);
    ctx.fillStyle = "#ffd23f";
    ctx.fillText(s.toast.text, W / 2, y);
  }
  ctx.restore();
}
