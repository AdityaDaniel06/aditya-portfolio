import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let cached: NeonQueryFunction<false, false> | null | undefined;

/** Neon SQL client, or null when DATABASE_URL isn't set (local dev without a DB still works). */
export function getSql(): NeonQueryFunction<false, false> | null {
  if (cached === undefined) {
    const url = process.env.DATABASE_URL;
    cached = url ? neon(url) : null;
  }
  return cached;
}
