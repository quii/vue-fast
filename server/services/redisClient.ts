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
    redisClient.destroy();
    redisClient = null;
  }

  // Determine the connection URL
  const url = config.url ||
    `redis://${config.username ? `${config.username}:${config.password}@` : ''}${config.host || 'localhost'}:${config.port || 6379}`;

  // Create a new client
  redisClient = createClient({ url });

  // Set up error handling
  redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
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
    if (redisClient.isOpen) {
      // Use close() instead of quit() as recommended
      await redisClient.close();
    }
    redisClient = null;
  }
}