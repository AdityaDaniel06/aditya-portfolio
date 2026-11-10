-- Portfolio database schema (Neon Postgres).
-- Safe to run repeatedly: only creates what's missing, never drops anything.
-- Run with `npm run db:setup`, or paste into the Neon console's SQL editor.

-- One row per visit (one per browser tab session). No raw IPs are stored:
-- visitor_hash = sha256(ip + IP_HASH_SALT).
CREATE TABLE IF NOT EXISTS visits (
  id           bigserial PRIMARY KEY,
  created_at   timestamptz NOT NULL DEFAULT now(),
  path         text,
  referrer     text,
  country      text,
  device       text,
  visitor_hash text
);
CREATE INDEX IF NOT EXISTS visits_created_at_idx ON visits (created_at);

-- Contact-form submissions. Saved before the email is sent, so nothing is lost
-- if the email fails (email_sent stays false).
CREATE TABLE IF NOT EXISTS messages (
  id           bigserial PRIMARY KEY,
  created_at   timestamptz NOT NULL DEFAULT now(),
  name         text NOT NULL,
  email        text NOT NULL,
  message      text NOT NULL,
  visitor_hash text,
  email_sent   boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages (created_at);

-- Fixed-window rate-limit counters (AI chat, contact form, visit beacon).
CREATE TABLE IF NOT EXISTS rate_limits (
  key          text NOT NULL,
  window_start timestamptz NOT NULL,
  count        int NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);
