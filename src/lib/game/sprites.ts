// Extra pixel art used only by Bug Dash. Same format as src/lib/sprites.ts.
import { Sprite, codeBlock, heroIdle, heroJump, heroWalk } from "@/lib/sprites";

const ink = "#1b1b2f";

const recolor = (s: Sprite, swap: Record<string, string>): Sprite => ({
  rows: s.rows,
  palette: { ...s.palette, ...swap },
});

// A winged glitch bug that hovers at jump height.
const flyBody = [
  "...KKKK...",
  "..KRRRRK..",
  ".KRWKRWKK.",
  ".KRRRRRRK.",
  "..KrRRrK..",
  "...KKKK...",
];
const flyPalette = { R: "#ff7a3d", r: "#c94a16", W: "#dff4ff", K: ink };

export const fly: Sprite = {
  palette: flyPalette,
  rows: [".WW....WW.", "WWWW..WWWW", ...flyBody],
};

export const fly2: Sprite = {
  palette: flyPalette,
  rows: [
    "..........",
    "..........",
    "...KKKK...",
    "WWKRRRRKWW",
    "WKRWKRWKKW",
    ".KRRRRRRK.",
    "..KrRRrK..",
    "...KKKK...",
  ],
};

// Rare gem, worth 5 coins.
export const gem: Sprite = {
  palette: { B: "#4fc3ff", b: "#1f7ae0", W: "#e8fbff", K: ink },
  rows: [
    "..KKKKK..",
    ".KWWBBbK.",
    "KWBBBBBbK",
    ".KBBBBbK.",
    "..KBBbK..",
    "...KbK...",
    "....K....",
  ],
};

export const magnet: Sprite = {
  palette: { R: "#ff3b5c", W: "#e6e6f0", K: ink },
  rows: [
    "KKK..KKK",
    "KWK..KWK",
    "KRK..KRK",
    "KRK..KRK",
    "KRRKKRRK",
    ".KRRRRK.",
    "..KKKK..",
  ],
};

// One 8px spike tile; drawn repeatedly for a spike strip.
export const spike: Sprite = {
  palette: { W: "#ffffff", S: "#b8b8d0", K: ink },
  rows: ["...KK...", "..KWSK..", "..KWSK..", ".KWSSSK.", ".KWSSSK.", "KKKKKKKK"],
};

// Plain platform brick.
export const stoneBlock: Sprite = {
  palette: { L: "#b39cff", M: "#7b5cff", K: ink },
  rows: [
    "KKKKKKKKKKKK",
    "KLLLLKLLLLLK",
    "KMMMMKMMMMMK",
    "KMMMMKMMMMMK",
    "KKKKKKKKKKKK",
    "KLLLLLLKLLLK",
    "KMMMMMMKMMMK",
    "KMMMMMMKMMMK",
    "KKKKKKKKKKKK",
    "KLLLKLLLLLLK",
    "KMMMKMMMMMMK",
    "KKKKKKKKKKKK",
  ],
};

// A code block after its coin has been taken.
export const usedBlock = recolor(codeBlock, { Y: "#8a8aa8", O: "#5a5a78", W: "#c8c8dc" });

// Hero hoodie colours cycled while the star power-up is active.
const rainbow = [
  { B: "#ffd23f", b: "#e89a00" },
  { B: "#2fd38a", b: "#1a9c60" },
  { B: "#4fc3ff", b: "#1f7ae0" },
];
export const heroRainbow = rainbow.map((swap) => ({
  idle: recolor(heroIdle, swap),
  walk: recolor(heroWalk, swap),
  jump: recolor(heroJump, swap),
}));
