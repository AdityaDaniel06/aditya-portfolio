# Architecture

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · GSAP · Lenis · Neon Postgres · Resend · OpenAI-compatible LLM (OpenRouter free models)

## Code layout

```
src/
  app/          page, layout, styles, API routes
  components/   one component per section + ChatBot, ContactForm, VisitTracker
  data/         resume.ts (all content)
  lib/          sprites, animation helpers, db, rate limits, offline answers
  lib/game/     Bug Dash engine, level patterns, game sprites
db/             schema.sql, queries.sql (stats)
scripts/        db-setup.mjs
```

## API routes

| Route | Does |
| --- | --- |
| `POST /api/chat` | Sends the question and resume to the LLM; falls back to offline answers |
| `POST /api/contact` | Validates the message, saves it to Neon, emails it via Resend |
| `POST /api/visit` | Records an anonymous page visit |

## Data (Neon)

- `visits`: page, referrer, country, device and a hashed visitor ID
- `messages`: contact form submissions
- `rate_limits`: counters for AI and contact form limits

## Limits

- **AI:** 5 chats per hour and 10 per day per visitor, 100 per day site-wide
- **Contact:** 3 messages per hour and 10 per day per visitor

## Security

- Secrets are only used server-side and never committed (`.env.local`)
- CSP and security headers (`next.config.ts`)
- Same-origin checks and body-size caps on every API route
- IPs are stored only as salted hashes
- Honeypot field against contact form spam
- The AI is switched off in production when no database is configured, so the limits can't be bypassed
