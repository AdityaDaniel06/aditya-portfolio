# Deployment

## Local

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run db:setup             # once, creates the Neon tables
npm run dev
```

## Vercel

1. Import the GitHub repo in Vercel. The default build settings work as they are.
2. Add the environment variables from `.env.local` (see `.env.example` for the list).
3. Set the function region to `iad1`, close to Neon.
4. After the first deploy, set `LLM_SITE_URL` to the live URL and redeploy.

## Services

| Service | Used for | Variable |
| --- | --- | --- |
| Neon | Database | `DATABASE_URL` |
| Resend | Contact emails | `RESEND_API_KEY`, `CONTACT_TO_EMAIL` |
| OpenRouter | Chatbot LLM | `LLM_*` |

Stats: run the queries in `db/queries.sql` from the Neon SQL Editor.
