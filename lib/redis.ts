import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

class MemoryRedisFallback {
  private sets: Map<string, Set<string>> = new Map();
  private hashes: Map<string, Map<string, string>> = new Map();

  async sadd(key: string, ...members: string[]): Promise<number> {
    if (!this.sets.has(key)) this.sets.set(key, new Set());
    const set = this.sets.get(key)!;
    let added = 0;
    for (const m of members) {
      if (!set.has(m)) {
        set.add(m);
        added++;
      }
    }
    return added;
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    const set = this.sets.get(key);
    if (!set) return 0;
    let removed = 0;
    for (const m of members) {
      if (set.delete(m)) removed++;
    }
    return removed;
  }

  async scard(key: string): Promise<number> {
    return this.sets.get(key)?.size || 0;
  }

  async smembers(key: string): Promise<string[]> {
    return Array.from(this.sets.get(key) || []);
  }

  async exists(key: string): Promise<number> {
    return this.sets.has(key) && (this.sets.get(key)?.size || 0) > 0 ? 1 : 0;
  }

  async del(key: string): Promise<number> {
    return this.sets.delete(key) ? 1 : 0;
  }
}

let redisClient: Redis | MemoryRedisFallback;
let isRedisAvailable = false;

try {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 2) return null; // fallback to memory
      return Math.min(times * 100, 1000);
    },
    lazyConnect: true,
  });

  client.connect().then(() => {
    isRedisAvailable = true;
    console.log("✔ Connected to Redis presence server.");
  }).catch(() => {
    isRedisAvailable = false;
    console.log("ℹ Redis server offline, using in-memory multi-device presence engine.");
  });

  client.on("error", () => {
    isRedisAvailable = false;
  });

  redisClient = client;
} catch {
  redisClient = new MemoryRedisFallback();
}

/**
 * Presence Helpers: Multi-device & multi-tab socket tracking
 */
export async function trackUserSocket(userId: string, socketId: string): Promise<number> {
  const key = `presence:user:${userId}`;
  try {
    if (isRedisAvailable && redisClient instanceof Redis) {
      await redisClient.sadd(key, socketId);
      return await redisClient.scard(key);
    }
  } catch {}
  return await (redisClient as MemoryRedisFallback).sadd(key, socketId);
}

export async function removeUserSocket(userId: string, socketId: string): Promise<number> {
  const key = `presence:user:${userId}`;
  try {
    if (isRedisAvailable && redisClient instanceof Redis) {
      await redisClient.srem(key, socketId);
      return await redisClient.scard(key);
    }
  } catch {}
  await (redisClient as MemoryRedisFallback).srem(key, socketId);
  return await (redisClient as MemoryRedisFallback).scard(key);
}

export async function getUserSocketCount(userId: string): Promise<number> {
  const key = `presence:user:${userId}`;
  try {
    if (isRedisAvailable && redisClient instanceof Redis) {
      return await redisClient.scard(key);
    }
  } catch {}
  return await (redisClient as MemoryRedisFallback).scard(key);
}

export async function isUserOnline(userId: string): Promise<boolean> {
  const count = await getUserSocketCount(userId);
  return count > 0;
}
