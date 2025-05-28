import Redis from 'ioredis';
import { Shoot, ShootParticipant } from '../../shared/models/Shoot.js';
import { ShootRepository } from '../../shared/ports/ShootRepository.js';
import { mergeShootChanges } from '../../shared/utils/shootMergeUtils.js';

export interface RedisShootRepositoryConfig {
  redisUrl?: string;
}

/**
 * Redis implementation of the ShootRepository interface
 */
export class RedisShootRepository implements ShootRepository {
  // @ts-ignore
  private redis: Redis;

  constructor(config: RedisShootRepositoryConfig = {}) {
    const redisUrl = config.redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';

    // Debug logging
    console.log('🔧 Redis URL being used:', redisUrl);
    console.log('🔧 Environment REDIS_URL:', process.env.REDIS_URL);

    // Configure ioredis to not send CLIENT commands
    // const redisOptions = {
    //   enableAutoPipelining: false,
    //   lazyConnect: true,
    //   // Disable client info commands that Upstash doesn't support
    //   enableReadyCheck: false,
    //   maxRetriesPerRequest: 3
    // };

    // @ts-ignore
    this.redis = new Redis(redisUrl, {family: 6});
    // this.redis = new Redis(redisUrl, redisOptions);

    // @ts-ignore
    this.redis.on('error', (err) => {
      // Suppress CLIENT command errors
      if (err.message && err.message.includes('CLIENT')) {
        console.warn('Redis CLIENT command not supported:', err.message);
        return;
      }
      console.error('Redis error:', err);
    });

    this.redis.on('connect', () => {
      console.log('✅ Connected to Redis');
    });
  }

  /**
   * Saves a shoot to Redis with optimistic locking
   */
  async saveShoot(shoot: Shoot): Promise<void> {
    const key = `shoots:${shoot.code}`;

    // Watch the key for changes
    await this.redis.watch(key);

    // Get the current value
    const currentValue = await this.redis.get(key);

    // If the key exists, merge changes
    if (currentValue !== null) {
      const currentShoot = this.deserializeShoot(currentValue);
      mergeShootChanges(currentShoot, shoot);
      shoot = currentShoot;
    }

    // Serialize the shoot data
    const serializedShoot = this.serializeShoot(shoot);

    // Calculate TTL in seconds
    const ttlSeconds = Math.max(
      1,
      Math.floor((shoot.expiresAt.getTime() - Date.now()) / 1000)
    );

    // Execute transaction
    const multi = this.redis.multi();
    multi.set(key, serializedShoot);
    multi.expire(key, ttlSeconds);
    multi.sadd('shoots:active', shoot.code);
    await multi.exec();
  }

  async getShootByCode(code: string): Promise<Shoot | null> {
    const serializedShoot = await this.redis.get(`shoots:${code}`);

    if (!serializedShoot) {
      return null;
    }

    try {
      const shoot = this.deserializeShoot(serializedShoot);

      // Check if expired
      if (new Date() > shoot.expiresAt) {
        await this.deleteShoot(code);
        return null;
      }

      return shoot;
    } catch (error) {
      console.error(`Error deserializing shoot ${code}:`, error);
      return null;
    }
  }

  async deleteShoot(code: string): Promise<void> {
    await this.redis.del(`shoots:${code}`);
    await this.redis.srem('shoots:active', code);
  }

  async codeExists(code: string): Promise<boolean> {
    const exists = await this.redis.exists(`shoots:${code}`);
    return exists === 1;
  }

  /**
   * Clears all data (for testing)
   */
  async clear(): Promise<void> {
    const stringCodes = await this.redis.smembers('shoots:active');

    if (stringCodes.length > 0) {
      // @ts-ignore
      const keys = stringCodes.map(code => `shoots:${code}`);
      await this.redis.del(...keys);
    }

    await this.redis.del('shoots:active');
  }

  /**
   * Close the Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }

  private serializeShoot(shoot: Shoot): string {
    const shootCopy = {
      ...shoot,
      createdAt: { __isDate: true, value: shoot.createdAt.toISOString() },
      expiresAt: { __isDate: true, value: shoot.expiresAt.toISOString() },
      lastUpdated: { __isDate: true, value: shoot.lastUpdated.toISOString() },
      participants: shoot.participants.map((p: ShootParticipant) => ({
        ...p,
        lastUpdated: { __isDate: true, value: p.lastUpdated.toISOString() }
      }))
    };

    return JSON.stringify(shootCopy);
  }

  private deserializeShoot(serialized: string): Shoot {
    const parsed = JSON.parse(serialized);

    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt.__isDate ? parsed.createdAt.value : parsed.createdAt),
      expiresAt: new Date(parsed.expiresAt.__isDate ? parsed.expiresAt.value : parsed.expiresAt),
      lastUpdated: new Date(parsed.lastUpdated.__isDate ? parsed.lastUpdated.value : parsed.lastUpdated),
      participants: parsed.participants.map((p: any) => ({
        ...p,
        lastUpdated: new Date(p.lastUpdated.__isDate ? p.lastUpdated.value : p.lastUpdated)
      }))
    };
  }
}