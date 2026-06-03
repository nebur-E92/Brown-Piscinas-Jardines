import { getDb } from "./db";

type RateLimitRow = {
  count: number;
};

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const sql = getDb();
  const resetAt = new Date(Date.now() + windowMs);

  const [row] = await sql<RateLimitRow[]>`
    INSERT INTO rate_limits (rate_key, count, reset_at)
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT (rate_key) DO UPDATE SET
      count = CASE
        WHEN rate_limits.reset_at <= now() THEN 1
        ELSE rate_limits.count + 1
      END,
      reset_at = CASE
        WHEN rate_limits.reset_at <= now() THEN ${resetAt}
        ELSE rate_limits.reset_at
      END,
      updated_at = now()
    RETURNING count
  `;

  return (row?.count ?? limit + 1) <= limit;
}
