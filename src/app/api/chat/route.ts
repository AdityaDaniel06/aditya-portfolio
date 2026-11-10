import { NextResponse } from "next/server";
import { profile, resumeAsText } from "@/data/resume";
import { fallbackAnswer } from "@/lib/fallbackAnswer";
import { allow, envInt, HOUR, DAY } from "@/lib/rateLimit";
import { readJson, sameOrigin, visitorHash } from "@/lib/visitor";

// Chat endpoint for the portfolio sidekick.
//
// Talks to ANY OpenAI-compatible /chat/completions API, configured in .env.local
// (see .env.example). Defaults to a local Ollama server, so it is free and private.
// If the LLM is missing or unreachable, it answers from the resume with simple
// keyword matching instead of failing.

export const runtime = "nodejs";

type Msg = { role: "user" | "assistant"; content: string };

const BASE_URL = (process.env.LLM_BASE_URL || "http://localhost:11434/v1").replace(/\/$/, "");
const MODEL = process.env.LLM_MODEL || "llama3.2";
const API_KEY = process.env.LLM_API_KEY || "";
const DISABLED = process.env.LLM_DISABLED === "true";
// OpenRouter extras (all optional; only sent when set, so other providers are unaffected).
// LLM_FALLBACK_MODELS: comma-separated models tried in order if the main one is rate-limited/down.
const FALLBACK_MODELS = (process.env.LLM_FALLBACK_MODELS || "")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const SITE_URL = process.env.LLM_SITE_URL || "";
const SITE_NAME = process.env.LLM_SITE_NAME || "";

const SYSTEM_PROMPT = `You are the friendly pixel-art sidekick on ${profile.name}'s portfolio website.
Answer visitors' questions about ${profile.name} using ONLY the resume below.
Rules:
- Be accurate. If the resume doesn't cover something, say you don't know and suggest emailing ${profile.email}.
- Keep answers short: under 120 words, plain text, no markdown tables.
- A light, playful retro-game tone is welcome, but facts come first.
- Refer to ${profile.name.split(" ")[0]} in the third person.
- Politely decline requests unrelated to ${profile.name} or his work.

RESUME:
${resumeAsText()}`;

function sanitize(body: unknown): Msg[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) return null;
  const msgs = (body as { messages: unknown[] }).messages
    .filter(
      (m): m is Msg =>
        !!m &&
        typeof m === "object" &&
        ((m as Msg).role === "user" || (m as Msg).role === "assistant") &&
        typeof (m as Msg).content === "string"
    )
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
  return msgs.length && msgs[msgs.length - 1].role === "user" ? msgs : null;
}

// Strict usage limits (env-tunable). Over the limit, visitors still get resume answers.
const LIMIT_HOUR = envInt("AI_LIMIT_HOUR", 5);
const LIMIT_DAY = envInt("AI_LIMIT_DAY", 10);
const LIMIT_GLOBAL_DAY = envInt("AI_LIMIT_GLOBAL_DAY", 100);

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await readJson(req);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const messages = sanitize(body);
  if (!messages) return NextResponse.json({ error: "Expected { messages: [...] } ending with a user message" }, { status: 400 });

  const question = messages[messages.length - 1].content;

  if (!DISABLED) {
    const v = visitorHash(req);
    // Without a database, allow locally (dev) but fail closed in production.
    const ok = await allow(
      [
        { key: `ai:${v}:hour`, windowSec: HOUR, max: LIMIT_HOUR },
        { key: `ai:${v}:day`, windowSec: DAY, max: LIMIT_DAY },
        { key: "ai:global:day", windowSec: DAY, max: LIMIT_GLOBAL_DAY },
      ],
      process.env.NODE_ENV !== "production"
    );
    if (!ok) return NextResponse.json({ reply: fallbackAnswer(question), source: "limited" });
  }

  if (!DISABLED) {
    try {
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
          ...(SITE_URL ? { "HTTP-Referer": SITE_URL } : {}),
          ...(SITE_NAME ? { "X-Title": SITE_NAME } : {}),
        },
        body: JSON.stringify({
          model: MODEL,
          ...(FALLBACK_MODELS.length ? { models: [MODEL, ...FALLBACK_MODELS] } : {}),
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          temperature: 0.4,
          // Headroom for models that "think" before answering (reasoning counts against this);
          // the system prompt still keeps the visible answer under ~120 words.
          max_tokens: 1000,
        }),
        signal: AbortSignal.timeout(45_000),
      });
      if (res.ok) {
        const data = (await res.json()) as { model?: string; choices?: { message?: { content?: string } }[] };
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) return NextResponse.json({ reply, source: "llm", model: data.model || MODEL });
      } else {
        console.warn(`[chat] LLM responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
      }
    } catch (err) {
      console.warn(`[chat] LLM unreachable at ${BASE_URL}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ reply: fallbackAnswer(question), source: "offline" });
}
