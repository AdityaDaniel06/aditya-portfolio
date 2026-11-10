import "server-only";
import { getSql } from "./db";

export type Limit = { key: string; windowSec: number; max: number };

/**
 * Fixed-window rate limiting stored in Neon (works across Vercel's serverless instances).
 * Counts one hit against every limit and returns true if all are within bounds.
 * Without a database it returns `whenNoDb` (fail closed for anything that costs money).
 */
export async function allow(limits: Limit[], whenNoDb: boolean): Promise<boolean> {
  const sql = getSql();
  if (!sql) return whenNoDb;
  try {
    const now = Date.now();
    const counts = await Promise.all(
      limits.map(async ({ key, windowSec }) => {
        const windowStart = new Date(Math.floor(now / (windowSec * 1000)) * windowSec * 1000).toISOString();
        const rows = (await sql`
          INSERT INTO rate_limits (key, window_start, count) VALUES (${key}, ${windowStart}, 1)
          ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1
          RETURNING count`) as { count: number }[];
        return rows[0]?.count ?? Infinity;
      })
    );
    // Occasionally clean up old windows.
    if (Math.random() < 0.01) {
      void sql`DELETE FROM rate_limits WHERE window_start < now() - interval '2 days'`.catch(() => {});
    }
    return counts.every((c, i) => c <= limits[i].max);
  } catch (err) {
    console.warn(`[rateLimit] DB error: ${(err as Error).message}`);
    return whenNoDb;
  }
}

export const HOUR = 3600;
export const DAY = 86400;

export function envInt(name: string, fallback: number): number {
  const n = Number.parseInt(process.env[name] || "", 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}
