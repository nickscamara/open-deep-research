import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Create a new Redis instance
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  // Disable HTTPS check in development
  automaticDeserialization: true,
  agent: process.env.NODE_ENV === 'development' ? {
    https: {
      rejectUnauthorized: false
    }
  } : undefined,
});

// Create a new rate limiter that allows 5 requests per 60 seconds
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});
