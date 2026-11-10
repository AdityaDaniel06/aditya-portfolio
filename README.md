# Aditya Daniel · Pixel Portfolio

A colourful, retro-game themed portfolio built with **Next.js 15**, **TypeScript**, **Tailwind v4**,
**GSAP** (scroll animations) and **Lenis** (smooth scrolling). Includes a playable mini-game
(*Bug Dash*) and an AI chat sidekick that answers questions about the resume.

All art is hand-made pixel sprites drawn in code (`src/lib/sprites.ts`), with no image files and no external assets.

## Run it

```bash
npm install
cp .env.example .env.local   # configure chatbot LLM, Neon and Resend
npm run db:setup             # once, after setting DATABASE_URL
npm run dev                  # http://localhost:3000
```

## Edit the content

Everything (site text **and** the chatbot's knowledge) comes from one file:
[`src/data/resume.ts`](src/data/resume.ts). Remember to set your GitHub URL there.

## Chatbot (free LLM)

`/api/chat` talks to any **OpenAI-compatible** endpoint, configured in `.env.local`:

| Option | Cost | Setup |
| --- | --- | --- |
| **Ollama** (default) | Free, runs locally | Install [ollama.com](https://ollama.com), then `ollama pull llama3.2` (or `gpt-oss:20b`, OpenAI's open-weight model) |
| Groq | Free tier | Key from console.groq.com, model `openai/gpt-oss-20b` |
| OpenRouter | Free `:free` models | Key from openrouter.ai |
| Google Gemini | Free tier | Key from aistudio.google.com |

If no LLM is configured or reachable, the chat keeps working in **offline mode**, answering from
the resume with keyword matching (`src/lib/fallbackAnswer.ts`).

**AI limits:** 5 chats/hour and 10/day per visitor, 100/day site-wide (`AI_LIMIT_*`). Over a limit the
chat answers from the resume instead. Limits are stored in Neon; in production without a database the
AI is switched off (fails closed), so nobody can drain your quota.

## Database, visits & contact form

- **Neon Postgres** stores page visits (anonymous: IPs are kept only as salted hashes), contact
  messages and rate-limit counters. Put the **pooled** connection string in `DATABASE_URL`, then run
  `npm run db:setup` once to create the tables (`db/schema.sql`, safe to re-run).
- **Stats:** open the Neon console → SQL Editor and run any query from [`db/queries.sql`](db/queries.sql)
  (visits per day, unique visitors, countries, referrers, devices, latest messages, AI usage).
- **Contact form** (`/api/contact`): saves each message to Neon, then emails it to `CONTACT_TO_EMAIL`
  through [Resend](https://resend.com) with Reply-To set to the visitor, so you can just hit Reply.
  Spam protection: a honeypot field plus 3 messages/hour and 10/day per visitor.
  If the email fails, the message is still in the `messages` table.

## Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel.
2. **Settings → Environment Variables**: add everything from your `.env.local`
   (`LLM_*`, `AI_LIMIT_*`, `DATABASE_URL`, `IP_HASH_SALT`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`).
   Set `LLM_SITE_URL` to your real domain.
3. **Settings → Functions → Region**: pick Washington D.C. (`iad1`), close to Neon's `us-east-2`.
4. Before going live, **rotate** any key that was ever pasted somewhere (OpenRouter, Resend, Neon password)
   and set a small credit limit on the OpenRouter key so it can never spend money.
5. Optional: turn on **Firewall → Bot Protection** in Vercel.

Security built in: patched Next.js/React (`npm audit` clean), strict security headers and CSP
(`next.config.ts`), same-origin checks and body-size caps on every API route, server-only secrets,
no raw IPs stored.

## Structure

```
src/
  app/            layout, page, globals.css, api/{chat,contact,visit}/route.ts, icon.svg
  components/     Nav, Hero, About, Skills, Experience, Projects, Game, Contact, ContactForm, ChatBot, VisitTracker, ...
  data/resume.ts  all content
  lib/            sprites (pixel art), gsap setup, scroll-reveal hook, offline answers, db, rate limits
db/               schema.sql (tables), queries.sql (stats for the Neon console)
scripts/          db-setup.mjs
```
