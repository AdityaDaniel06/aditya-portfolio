# Design

A colourful 8-bit look: chunky pixel borders, hand-drawn sprites and playful motion.

## Visual language

- **Pixel art in code:** every sprite is drawn in code (`src/lib/sprites.ts`); there are no image files.
- **Pixel UI:** boxes and buttons get stepped borders from stacked box-shadows (`.px-box`, `.px-btn`).
- **CRT feel:** a light scanline overlay across the page.

## Sections as "biomes"

Each section has its own background world:

| Section | Biome |
| --- | --- |
| Hero | Sky |
| About | Meadow |
| Skills | Cave |
| Experience | Sunset |
| Projects | Ocean |
| Game | Night |
| Contact | Candy |

## Colour and type

- **Palette:** ink `#1b1b2f`, cream `#fff6e0`, pink, yellow, green, blue, purple, orange (tokens in `globals.css`)
- **Fonts:** *Press Start 2P* for headings and buttons, *Pixelify Sans* for body text

## Motion

- Smooth scrolling with **Lenis**
- Scroll-triggered reveals with **GSAP**
- Stepped idle animations (bob, coin spin, blink)
- `prefers-reduced-motion` is respected
