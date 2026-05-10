// Per-key sliding-window rate limiter.
//
// Storage is an in-memory Map, so this is correct only for a single-instance
// deployment (one Railway container). If the app ever scales horizontally,
// this needs to move to a shared store (Redis, DB, etc.) — different instances
// would otherwise track separate counters and the effective limit would
// multiply by the number of instances.

const buckets = new Map<string, number[]>();

export interface RateLimitOptions {
  max: number;
  windowMs: number;
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - options.windowMs;
  const previous = buckets.get(key) ?? [];
  const recent = previous.filter((t) => t > cutoff);

  if (recent.length >= options.max) {
    const oldest = recent[0] ?? now;
    const retryAfterMs = oldest + options.windowMs - now;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { allowed: true };
}

export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}
