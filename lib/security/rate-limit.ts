type RateLimitResult = { success: boolean; remaining: number };

function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, number[]>();

  // Clean old entries every minute
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requests.entries()) {
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) requests.delete(key);
      else requests.set(key, valid);
    }
  }, 60000);

  return function check(key: string): RateLimitResult {
    const now = Date.now();
    const timestamps = requests.get(key) || [];
    const valid = timestamps.filter((t) => now - t < windowMs);

    if (valid.length >= maxRequests) {
      return { success: false, remaining: 0 };
    }

    valid.push(now);
    requests.set(key, valid);
    return { success: true, remaining: maxRequests - valid.length };
  };
}

export const apiRateLimit = createRateLimiter(60, 60000); // 60/min
export const authRateLimit = createRateLimiter(10, 60000); // 10/min
export const aiRateLimit = createRateLimiter(30, 60000); // 30/min
