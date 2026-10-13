/**
 * Simple per-instance fixed-window rate limit. For multi-instance deployments use a shared
 * store (e.g. Redis/Upstash) — see docs/OPERATIONS.md.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimited(key: string, max: number, windowMs: number, now = Date.now()) {
  const entry = buckets.get(key);
  if (!entry || entry.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > max;
}

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
