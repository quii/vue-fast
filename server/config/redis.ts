import dotenv from 'dotenv';
import { RedisConfig } from '../services/redisClient.js';

// Load environment variables
dotenv.config();

/**
 * Gets Redis configuration from environment variables
 * @returns Redis configuration object
 */
export function getRedisConfig(): RedisConfig {
  return {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
  };
}