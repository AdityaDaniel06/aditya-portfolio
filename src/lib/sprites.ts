// Hand-made pixel art. Each sprite is a grid of characters; each character maps
// to a colour in the palette ("." = transparent). Used by both SVG (UI) and
// canvas (mini-game) renderers.

export type Sprite = { rows: string[]; palette: Record<string, string> };

const ink = "#1b1b2f";

const heroPalette = {
  H: "#3b2416", // hair
  S: "#f5c08a", // skin
  G: ink, // glasses frame
  E: "#ffffff", // lens shine
  M: "#c2410c", // mouth
  B: "#ff4f9a", // hoodie
  b: "#c81e6e", // hoodie shade
  W: "#fff6e0", // hoodie logo
  P: "#2d2d6e", // pants
  K: ink, // shoes
};

const heroTop = [
  "...HHHHHH...",
  "..HHHHHHHH..",
  ".HHHHHHHHHH.",
  ".HHSSSSSSHH.",
  ".HGGGSSGGGH.",
  ".HGEGSSGEGH.",
  "..SSSSSSSS..",
  "..SSSMMSSS..",
  "...SSSSSS...",
  "..BBBBBBBB..",
  ".BBBbWWbBBB.",
  "SBBBbWWbBBBS",
  "S.BBBBBBBB.S",
  "..PPPPPPPP..",
];

export const heroIdle: Sprite = {
  palette: heroPalette,
  rows: [...heroTop, "..PP....PP..", ".KKK....KKK."],
};

export const heroWalk: Sprite = {
  palette: heroPalette,
  rows: [...heroTop, "..PP...PP...", ".KKK...KKK.."],
};

export const heroJump: Sprite = {
  palette: heroPalette,
  rows: [
    ...heroTop.slice(0, 11),
    "SBBBBBBBBBBS",
    "..BBBBBBBB..",
    "..PPPPPPPP..",
    ".PP......PP.",
    "KK........KK",
  ],
};

export const coin: Sprite = {
  palette: { Y: "#ffd23f", O: "#e89a00", W: "#fff7c2", K: ink },
  rows: [
    "..KKKK..",
    ".KYYYYK.",
    "KYWYYOYK",
    "KYWYYOYK",
    "KYWYYOYK",
    "KYYYYOYK",
    ".KYOOYK.",
    "..KKKK..",
  ],
};

export const heart: Sprite = {
  palette: { R: "#ff3b5c", W: "#ffd1dc", K: ink },
  rows: [
    ".KK.KK.",
    "KRRKRRK",
    "KWRRRRK",
    "KRRRRRK",
    ".KRRRK.",
    "..KRK..",
    "...K...",
  ],
};

export const star: Sprite = {
  palette: { Y: "#ffd23f", K: ink, W: "#fffbe0" },
  rows: [
    "....K....",
    "...KYK...",
    "...KYK...",
    "KKKKWKKKK",
    ".KYYYYYK.",
    "..KYYYK..",
    ".KYYKYYK.",
    ".KYK.KYK.",
    ".KK...KK.",
  ],
};

// An original "glitch bug" enemy.
export const bug: Sprite = {
  palette: { P: "#7b5cff", p: "#4b2fc9", W: "#ffffff", K: ink, G: "#2fd38a" },
  rows: [
    ".G......G.",
    "..G....G..",
    "...KKKK...",
    "..KPPPPK..",
    ".KPWKPWKK.",
    ".KPPPPPPK.",
    "KPpPPPPpPK",
    "KPPpPPpPPK",
    ".KKKKKKKK.",
    ".K.K..K.K.",
  ],
};

export const bug2: Sprite = {
  palette: bug.palette,
  rows: [...bug.rows.slice(0, 9), "K.K....K.K"],
};

export const cloud: Sprite = {
  palette: { W: "#ffffff", B: "#cfe9ff", K: ink },
  rows: [
    ".....KKKK.......",
    "....KWWWWK.KKK..",
    "..KKWWWWWWKWWWK.",
    ".KWWWWWWWWWWWWWK",
    "KWWWWWWWWWWWWWWK",
    "KBWWWWWWWWWWWWBK",
    ".KBBBBBBBBBBBBK.",
    "..KKKKKKKKKKKK..",
  ],
};

// "</>" code block — our take on a bonus block.
export const codeBlock: Sprite = {
  palette: { Y: "#ffb020", O: "#c96a00", W: "#fff3c4", K: ink },
  rows: [
    "KKKKKKKKKKKK",
    "KWWWWWWWWWOK",
    "KWYYYYYYYYOK",
    "KWYYYYYKYYOK",
    "KWYKYYKYKYOK",
    "KWKYYYKYYKOK",
    "KWYKYKYYKYOK",
    "KWYYYKYYYYOK",
    "KWYYYYYYYYOK",
    "KWYYYYYYYYOK",
    "KOOOOOOOOOOK",
    "KKKKKKKKKKKK",
  ],
};

export const grassTile: Sprite = {
  palette: { G: "#2fd38a", g: "#1a9c60", D: "#b5652e", d: "#8a4a1e", L: "#c97b40" },
  rows: [
    "GGGGGGGGGGGG",
    "GgGGGgGGGgGG",
    "gggggggggggg",
    "DDDDDDDDDDDD",
    "DdDDLDDDdDDD",
    "DDDDDDdDDDLD",
    "DLDdDDDDDDDD",
    "DDDDDDDLDdDD",
  ],
};

export const flower: Sprite = {
  palette: { P: "#ff4f9a", Y: "#ffd23f", G: "#1a9c60" },
  rows: [".P.P.", "PPYPP", ".PPP.", "..G..", ".GG..", "..G.."],
};

export const trophy: Sprite = {
  palette: { Y: "#ffd23f", O: "#e89a00", K: ink, W: "#fffbe0" },
  rows: [
    "KKKKKKKKKK",
    "KYWYYYYYOK",
    "KYWYYYYYOKK",
    "KKYWYYYYOK.",
    ".KYYYYYOK..",
    "..KYYYOK...",
    "...KYOK....",
    "....KK.....",
    "...KYOK....",
    "..KKKKKK...",
  ],
};

export const chatBubble: Sprite = {
  palette: { W: "#ffffff", K: ink, B: "#4fc3ff" },
  rows: [
    ".KKKKKKKKKK.",
    "KWWWWWWWWWWK",
    "KWBBWBBWBBWK",
    "KWWWWWWWWWWK",
    "KWWWWWWWWWWK",
    ".KKKWWKKKKK.",
    "...KWK......",
    "...KK.......",
  ],
};

/** Merge horizontal runs into rects for compact SVG/canvas drawing. */
export function spriteRects(s: Sprite) {
  const rects: { x: number; y: number; w: number; c: string }[] = [];
  s.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === "." || !s.palette[ch]) {
        x++;
        continue;
      }
      let w = 1;
      while (row[x + w] === ch) w++;
      rects.push({ x, y, w, c: s.palette[ch] });
      x += w;
    }
  });
  return rects;
}

export function spriteSize(s: Sprite) {
  return { w: Math.max(...s.rows.map((r) => r.length)), h: s.rows.length };
}

/** Pre-render a sprite to an offscreen canvas at an integer scale. */
export function spriteToCanvas(s: Sprite, scale: number, flip = false) {
  const { w, h } = spriteSize(s);
  const c = document.createElement("canvas");
  c.width = w * scale;
  c.height = h * scale;
  const ctx = c.getContext("2d")!;
  for (const r of spriteRects(s)) {
    ctx.fillStyle = r.c;
    const x = flip ? w - r.x - r.w : r.x;
    ctx.fillRect(x * scale, r.y * scale, r.w * scale, scale);
  }
  return c;
}
