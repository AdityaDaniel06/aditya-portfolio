import { getSql } from "@/lib/db";
import { allow, HOUR } from "@/lib/rateLimit";
import { readJson, sameOrigin, visitorHash } from "@/lib/visitor";

// Records one page visit. Called by <VisitTracker /> once per tab session via sendBeacon.
// Stores no raw IP: only a salted hash, the country Vercel detected, and mobile/desktop.

export const runtime = "nodejs";

const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|curl|wget|python|axios|node-fetch/i;

export async function POST(req: Request) {
  const done = new Response(null, { status: 204 });
  const ua = req.headers.get("user-agent") || "";
  if (!sameOrigin(req) || !ua || BOT_UA.test(ua)) return done;

  const sql = getSql();
  if (!sql) return done;

  let body: { path?: unknown; referrer?: unknown } = {};
  try {
    body = (await readJson(req, 2048)) as typeof body;
  } catch {
    return done;
  }

  const v = visitorHash(req);
  if (!(await allow([{ key: `visit:${v}:hour`, windowSec: HOUR, max: 30 }], false))) return done;

  const path = typeof body.path === "string" ? body.path.slice(0, 200) : "/";
  let referrer: string | null = null;
  if (typeof body.referrer === "string" && body.referrer) {
    try {
      const host = new URL(body.referrer).host;
      // Internal navigation isn't a referrer.
      if (host !== (req.headers.get("x-forwarded-host") || req.headers.get("host"))) referrer = host.slice(0, 200);
    } catch {}
  }
  const country = req.headers.get("x-vercel-ip-country")?.slice(0, 8) || null;
  const device = /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";

  try {
    await sql`INSERT INTO visits (path, referrer, country, device, visitor_hash)
              VALUES (${path}, ${referrer}, ${country}, ${device}, ${v})`;
  } catch (err) {
    console.warn(`[visit] DB error: ${(err as Error).message}`);
  }
  return done;
}
