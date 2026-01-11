import { SecurityError } from '@/lib/security/errors';

interface BucketState {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, BucketState>();

function hitBucket(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now > current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= limit) {
    throw new SecurityError(429, 'rate_limited', 'Rate limit exceeded');
  }

  current.count += 1;
}

export function rateLimitOrThrow(
  key: string,
  limits: { perMinute: number; perDay: number }
) {
  hitBucket(`${key}:m`, limits.perMinute, 60_000);
  hitBucket(`${key}:d`, limits.perDay, 86_400_000);
}
