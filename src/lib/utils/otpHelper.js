import crypto from "crypto";

/**
 * Generates a cryptographically secure 6-digit OTP code
 * @returns {string} 6-digit numeric OTP code
 */
export function generateSecureOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Computes SHA-256 hash of a raw OTP string
 * @param {string} otp 
 * @returns {string} 64-character hex hash
 */
export function hashOtp(otp) {
  if (!otp) return "";
  return crypto.createHash("sha256").update(String(otp).trim()).digest("hex");
}

/**
 * Safely compares a raw OTP string against a stored SHA-256 hash
 * @param {string} rawOtp 
 * @param {string} hashedOtp 
 * @returns {boolean}
 */
export function verifyOtpHash(rawOtp, hashedOtp) {
  if (!rawOtp || !hashedOtp) return false;
  const inputHash = hashOtp(rawOtp);
  
  // Timing-safe buffer comparison to prevent timing attacks
  try {
    const a = Buffer.from(inputHash, "utf8");
    const b = Buffer.from(hashedOtp, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Extracts client IP address from Next.js request headers
 * @param {Request} request 
 * @returns {string} IP address or 'unknown'
 */
export function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

// In-memory fallback rate-limiting cache (used if Upstash Redis is unreachable or unconfigured)
const inMemoryRateMap = new Map();

/**
 * Checks rate limit for a specific identifier (email or IP)
 * Default limit: 3 requests per 10 minutes (600 seconds)
 * 
 * @param {string} key Prefix key (e.g. 'ratelimit:email:user@gmail.com')
 * @param {number} maxRequests Maximum allowed requests in window
 * @param {number} windowSeconds Window duration in seconds
 * @returns {Promise<{allowed: boolean, remaining: number, retryAfterSeconds: number}>}
 */
export async function checkOtpRateLimit(key, maxRequests = 3, windowSeconds = 600) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      // Execute multi-command pipeline on Upstash REST API
      const pipelineRes = await fetch(`${redisUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["TTL", key],
        ]),
        cache: "no-store",
      });

      if (pipelineRes.ok) {
        const results = await pipelineRes.json();
        const count = results[0]?.result || 1;
        let ttl = results[1]?.result;

        // If newly created key (count === 1) or TTL not set (-1), set expiration
        if (count === 1 || ttl < 0) {
          await fetch(`${redisUrl}/EXPIRE/${encodeURIComponent(key)}/${windowSeconds}`, {
            headers: { Authorization: `Bearer ${redisToken}` },
            cache: "no-store",
          });
          ttl = windowSeconds;
        }

        if (count > maxRequests) {
          return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
          };
        }

        return {
          allowed: true,
          remaining: Math.max(0, maxRequests - count),
          retryAfterSeconds: 0,
        };
      }
    } catch (err) {
      console.warn("⚠️ Upstash Redis rate limiter error, using in-memory fallback:", err.message);
    }
  }

  // --- In-Memory Fallback Rate Limiter ---
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = inMemoryRateMap.get(key);

  if (!record || now > record.resetAt) {
    inMemoryRateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 };
  }

  if (record.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count, retryAfterSeconds: 0 };
}
