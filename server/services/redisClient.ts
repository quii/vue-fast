import { createClient } from 'redis';

// Configuration options for Redis client
export interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  username?: string;
}

// Single client instance
let redisClient: ReturnType<typeof createClient> | null = null;

/**
 * Gets or creates a Redis client with the given configuration
 * @param config Redis configuration options
 * @returns A connected Redis client
 */
export async function getRedisClient(config: RedisConfig = {}): Promise<ReturnType<typeof createClient>> {
  // If we already have a client and it's open, return it
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }


  // If we have a client but it's closed, destroy it
  if (redisClient) {
    console.log('❓ Had a redis client that was closed, destroying it');
    redisClient.destroy();
    redisClient = null;
  }

  // Determine the connection URL
  const url = config.url || process.env.REDIS_URL ||
    `redis://${config.username ? `${config.username}:${config.password}@` : ''}${config.host || 'localhost'}:${config.port || 6379}`;

  // Create a new client
  redisClient = createClient({url});

  redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  // Add connection event logging
  redisClient.on('connect', () => {
    console.log('✅ Connected to Redis');
  });

  redisClient.on('ready', () => {
    console.log('✅ Redis client ready');
  });

  // Connect to Redis
  await redisClient.connect();

  return redisClient;
}

/**
 * Closes the Redis client connection
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    try {
      if (redisClient.isOpen) {
        await redisClient.quit();
      }
    } catch (error) {
      // Ignore errors during cleanup
      console.warn('Error during Redis cleanup (ignored):', error);
    }
    redisClient = null;
  }
}