// Level chunks. Each pattern adds things starting at x and returns its length,
// so the spawner knows where the next chunk can begin. Harder chunks unlock
// as the run gets longer (min = distance travelled).
import { BLOCK, GROUND, MAX_LIVES, PLATFORM_Y } from "./constants";
import type { GameState, Thing } from "./engine";

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));

const coin = (x: number, y: number): Thing => ({ kind: "coin", x, y, w: 8, h: 8 });
const gem = (x: number, y: number): Thing => ({ kind: "gem", x, y, w: 9, h: 7 });
const bug = (x: number): Thing => ({ kind: "bug", x, y: GROUND - 10, w: 10, h: 10 });
const fly = (x: number, y = GROUND - 34): Thing => ({
  kind: "fly", x, y, baseY: y, w: 10, h: 8, phase: Math.random() * 100,
});
const block = (x: number, y: number, coin = false): Thing => ({
  kind: "block", x, y, w: BLOCK, h: BLOCK, coin,
});
const spikes = (x: number, n: number): Thing => ({ kind: "spike", x, y: GROUND - 6, w: 8 * n, h: 6 });

/** A row of blocks; `coinBlocks` of them (random) hide a coin. */
function platform(s: GameState, x: number, y: number, n: number, coinBlocks: number) {
  const hidden = new Set<number>();
  while (hidden.size < Math.min(coinBlocks, n)) hidden.add(randInt(0, n - 1));
  for (let i = 0; i < n; i++) s.things.push(block(x + i * BLOCK, y, hidden.has(i)));
}

function coinRow(s: GameState, x: number, y: number, n: number, gap = 13) {
  for (let i = 0; i < n; i++) s.things.push(coin(x + i * gap, y));
}

type Pattern = { min: number; weight: number; make: (s: GameState, x: number) => number };

const PATTERNS: Pattern[] = [
  { min: 0, weight: 3, make: (s, x) => (s.things.push(bug(x)), 10) },
  {
    min: 0,
    weight: 2,
    make: (s, x) => {
      const n = randInt(4, 6);
      coinRow(s, x, GROUND - 24 - rand(0, 28), n);
      return n * 13;
    },
  },
  {
    // coin arc over (sometimes) a bug, middle coin may be a gem
    min: 0,
    weight: 2,
    make: (s, x) => {
      for (let i = 0; i <= 6; i++) {
        const cx = x + i * 12;
        const cy = GROUND - 14 - Math.sin((i / 6) * Math.PI) * 44;
        s.things.push(i === 3 && Math.random() < 0.2 ? gem(cx, cy) : coin(cx, cy));
      }
      if (s.dist > 300 && Math.random() < 0.5) s.things.push(bug(x + 31));
      return 84;
    },
  },
  {
    // floating platform, coins on top, coin blocks to bump from below
    min: 0,
    weight: 2,
    make: (s, x) => {
      const n = randInt(3, 5);
      platform(s, x, PLATFORM_Y, n, randInt(1, 2));
      if (Math.random() < 0.6) coinRow(s, x + 2, PLATFORM_Y - 14, n, BLOCK);
      return n * BLOCK;
    },
  },
  {
    min: 600,
    weight: 2,
    make: (s, x) => {
      platform(s, x, PLATFORM_Y, 4, 1);
      coinRow(s, x + 2, PLATFORM_Y - 14, 4, BLOCK);
      s.things.push(bug(x + 4 * BLOCK + 10)); // just past the end: drop on it for a stomp
      return 4 * BLOCK + 20;
    },
  },
  {
    // flyer at jump height, with coins underneath for staying low
    min: 1500,
    weight: 2,
    make: (s, x) => {
      s.things.push(fly(x));
      coinRow(s, x - 6, GROUND - 10, 3, 12);
      return 30;
    },
  },
  {
    min: 1500,
    weight: 2,
    make: (s, x) => {
      s.things.push(bug(x), bug(x + 16));
      return 26;
    },
  },
  {
    min: 2500,
    weight: 2,
    make: (s, x) => {
      const n = randInt(3, 4);
      s.things.push(spikes(x, n));
      coinRow(s, x + n * 4 - 17, GROUND - 42, 3, 13);
      return n * 8;
    },
  },
  {
    // three rising steps with treasure on top
    min: 2500,
    weight: 1,
    make: (s, x) => {
      platform(s, x, GROUND - 32, 2, 0);
      platform(s, x + 40, GROUND - 56, 2, 1);
      platform(s, x + 80, GROUND - 80, 2, 0);
      s.things.push(coin(x + 80, GROUND - 94));
      s.things.push(Math.random() < 0.3 ? gem(x + 88, GROUND - 93) : coin(x + 92, GROUND - 94));
      return 104;
    },
  },
  {
    min: 4000,
    weight: 1,
    make: (s, x) => {
      s.things.push(bug(x), fly(x + 44));
      return 54;
    },
  },
  {
    // power-up sitting on a short platform
    min: 800,
    weight: 1,
    make: (s, x) => {
      const options: Thing["kind"][] = ["magnet"];
      if (s.lives < MAX_LIVES) options.push("heart", "heart");
      if (s.star <= 0) options.push("star");
      const kind = options[randInt(0, options.length - 1)];
      const size = kind === "heart" ? 7 : kind === "star" ? 9 : 8;
      platform(s, x, PLATFORM_Y, 2, 0);
      s.things.push({ kind, x: x + BLOCK - size / 2, y: PLATFORM_Y - size - 4, baseY: PLATFORM_Y - size - 4, w: size, h: size });
      return 2 * BLOCK;
    },
  },
];

/** Adds the next chunk at x and returns its length in pixels. */
export function spawnPattern(s: GameState, x: number) {
  const open = PATTERNS.filter((p) => p.min <= s.dist);
  let roll = Math.random() * open.reduce((sum, p) => sum + p.weight, 0);
  for (const p of open) {
    roll -= p.weight;
    if (roll <= 0) return p.make(s, x);
  }
  return open[0].make(s, x);
}
