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

  // Check if this is Upstash (or set via environment variable)
  const isUpstash = url.includes('upstash.io') || process.env.REDIS_DISABLE_CLIENT_INFO === 'true';

  // Create client configuration
  const clientConfig: any = { url };

  if (isUpstash) {
    // Disable CLIENT commands for Upstash compatibility
    clientConfig.socket = {
      reconnectStrategy: false, // Better for serverless
      connectTimeout: 10000,
    };
  }

  // Create a new client
  redisClient = createClient(clientConfig);

  // Set up error handling - filter out Upstash compatibility errors
  redisClient.on('error', (err) => {
    // Suppress known Upstash compatibility errors
    if (err.message && (
      err.message.includes('CLIENT SETINFO') ||
      err.message.includes('CLIENT SETNAME') ||
      err.message.includes('not available')
    )) {
      console.warn('Redis compatibility warning (can be ignored):', err.message);
      return;
    }
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
      await redisClient.quit();
    }
    redisClient = null;
  }
}