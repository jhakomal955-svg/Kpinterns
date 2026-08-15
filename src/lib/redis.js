/**
 * Upstash Redis Helper
 * High-performance REST-based Redis client for edge & serverless Next.js
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Execute Redis command via Upstash REST API
 * @param {Array<string|number>} command - e.g. ['GET', 'key'] or ['SET', 'key', 'val', 'EX', 60]
 */
export async function redisCommand(...command) {
  if (!REDIS_URL || !REDIS_TOKEN) {
    return null;
  }

  try {
    const res = await fetch(`${REDIS_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.warn(`⚠️ Upstash Redis error (${res.status}): ${await res.text()}`);
      return null;
    }

    const data = await res.json();
    return data.result;
  } catch (error) {
    console.error("❌ Redis operation failed:", error.message);
    return null;
  }
}

/**
 * Get cached JSON value from Redis
 */
export async function redisGet(key) {
  const result = await redisCommand("GET", key);
  if (!result) return null;
  try {
    return JSON.parse(result);
  } catch {
    return result;
  }
}

/**
 * Set JSON value in Redis with optional TTL (seconds)
 */
export async function redisSet(key, value, ttlSeconds = 60) {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  if (ttlSeconds > 0) {
    return await redisCommand("SET", key, serialized, "EX", ttlSeconds);
  }
  return await redisCommand("SET", key, serialized);
}

/**
 * Delete key from Redis
 */
export async function redisDel(key) {
  return await redisCommand("DEL", key);
}
