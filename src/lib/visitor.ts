import "server-only";
import { createHash } from "node:crypto";

/** Client IP. On Vercel the first x-forwarded-for entry is the real client. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/** Salted hash of the IP, so raw IPs are never stored. */
export function visitorHash(req: Request): string {
  const salt = process.env.IP_HASH_SALT || "dev-salt-change-me";
  return createHash("sha256").update(`${clientIp(req)}|${salt}`).digest("hex").slice(0, 32);
}

/**
 * Rejects browser requests from other websites. Browsers always send Origin on
 * cross-origin POSTs; it must match the host this app is served from.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Reads a JSON body, refusing anything larger than maxBytes. */
export async function readJson(req: Request, maxBytes = 16_384): Promise<unknown> {
  const text = await req.text();
  if (text.length > maxBytes) throw new Error("Body too large");
  return JSON.parse(text);
}
