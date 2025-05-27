import { Shoot, ShootParticipant } from '../../shared/models/Shoot.js';
import { ShootRepository } from '../../shared/ports/ShootRepository.js';
import { getRedisClient } from '../services/redisClient.js';
import { mergeShootChanges } from '../../shared/utils/shootMergeUtils.js';

export interface RedisShootRepositoryConfig {
  redisUrl?: string;
}

/**
 * Redis implementation of the ShootRepository interface
 */
export class RedisShootRepository implements ShootRepository {
  private redisConfig: RedisShootRepositoryConfig;

  constructor(config: RedisShootRepositoryConfig = {}) {
    this.redisConfig = config;
  }

  /**
   * Saves a shoot to Redis with optimistic locking
   * @param shoot The shoot to save
   * @param retries Number of retries for optimistic locking (default: 3)
   */
  async saveShoot(shoot: Shoot, retries = 3): Promise<void> {
    const client = await getRedisClient({ url: this.redisConfig.redisUrl });
    const key = `shoots:${shoot.code}`;

    // Start a transaction
    const multi = client.multi();

    // Watch the key for changes
    await client.watch(key);

    // Get the current value
    const currentValue = await this.getStringFromRedis(key);

    // If the key exists, check if it has been modified
    if (currentValue !== null) {
      const currentShoot = this.deserializeShoot(currentValue);

      // Always merge changes from the incoming shoot to the current shoot
      // This ensures we don't lose any updates
      mergeShootChanges(currentShoot, shoot);

      // Use the merged shoot for saving
      shoot = currentShoot;
    }

    // Serialize the shoot data
    const serializedShoot = this.serializeShoot(shoot);

    // Calculate TTL in seconds (time until expiration)
    const ttlSeconds = Math.max(
      1, // Minimum 1 second
      Math.floor((shoot.expiresAt.getTime() - Date.now()) / 1000)
    );

    // Add commands to the transaction
    multi.set(key, serializedShoot);
    multi.expire(key, ttlSeconds);
    multi.sAdd('shoots:active', shoot.code);

    // Execute the transaction
    await multi.exec();
  }

  /**
   * Gets a shoot by its code
   * @param code The shoot code
   * @returns The shoot or null if not found or expired
   */
  async getShootByCode(code: string): Promise<Shoot | null> {
    const serializedShoot = await this.getStringFromRedis(`shoots:${code}`);

    if (!serializedShoot) {
      return null;
    }

    try {
      // Deserialize the shoot data
      const shoot = this.deserializeShoot(serializedShoot);

      // Check if the shoot has expired
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

  /**
   * Deletes a shoot
   * @param code The shoot code
   */
  async deleteShoot(code: string): Promise<void> {
    const client = await getRedisClient({ url: this.redisConfig.redisUrl });

    // Delete the shoot data
    await client.del(`shoots:${code}`);

    // Remove from active shoots set
    await client.sRem('shoots:active', code);
  }

  /**
   * Checks if a shoot code exists
   * @param code The shoot code to check
   * @returns True if the code exists, false otherwise
   */
  async codeExists(code: string): Promise<boolean> {
    const client = await getRedisClient({ url: this.redisConfig.redisUrl });

    // Check if the key exists
    const exists = await client.exists(`shoots:${code}`);
    return exists === 1;
  }

  /**
   * Clears all data (for testing)
   */
  async clear(): Promise<void> {
    const client = await getRedisClient({ url: this.redisConfig.redisUrl });

    // Get all active shoot codes
    const stringCodes = await this.getStringArrayFromRedis('shoots:active');

    // Delete all shoot data
    if (stringCodes.length > 0) {
      const keys = stringCodes.map(code => `shoots:${code}`);
      await client.del(keys);
    }

    // Clear the active shoots set
    await client.del('shoots:active');
  }

  /**
   * Serializes a shoot object to a JSON string with special handling for Date objects
   * @param shoot The shoot to serialize
   * @returns Serialized shoot data
   */
  private serializeShoot(shoot: Shoot): string {
    // Create a deep copy with date markers
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

  /**
   * Deserializes a JSON string to a shoot object with special handling for Date objects
   * @param serialized The serialized shoot data
   * @returns Deserialized shoot object
   */
  private deserializeShoot(serialized: string): Shoot {
    const parsed = JSON.parse(serialized);

    // Convert date markers back to Date objects
    const shoot = {
      ...parsed,
      createdAt: new Date(parsed.createdAt.__isDate ? parsed.createdAt.value : parsed.createdAt),
      expiresAt: new Date(parsed.expiresAt.__isDate ? parsed.expiresAt.value : parsed.expiresAt),
      lastUpdated: new Date(parsed.lastUpdated.__isDate ? parsed.lastUpdated.value : parsed.lastUpdated),
      participants: parsed.participants.map((p: any) => ({
        ...p,
        lastUpdated: new Date(p.lastUpdated.__isDate ? p.lastUpdated.value : p.lastUpdated)
      }))
    };

    return shoot;
  }

  /**
   * Cleans up expired shoots
   * @returns The number of shoots cleaned up
   */
  async cleanupExpiredShoots(): Promise<number> {
    // Get all active shoot codes
    const stringCodes = await this.getStringArrayFromRedis('shoots:active');
    let cleanedCount = 0;

    // Check each shoot
    for (const code of stringCodes) {
      const shoot = await this.getShootByCode(code);

      // If the shoot is null, it was already cleaned up by getShootByCode
      if (shoot === null) {
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
  /**
   * Gets multiple shoots by their codes
   * @param codes Array of shoot codes
   * @returns Map of code to shoot (excluding expired or not found shoots)
   */
  async getShootsByCodes(codes: string[]): Promise<Map<string, Shoot>> {
    const client = await getRedisClient({ url: this.redisConfig.redisUrl });
    const result = new Map<string, Shoot>();

    if (codes.length === 0) {
      return result;
    }

    // Get all shoots in a single batch operation
    const keys = codes.map(code => `shoots:${code}`);
    const mGetResult = await client.mGet(keys);

    // Ensure we have an array (convert from Set if needed)
    const serializedShoots = Array.isArray(mGetResult) ? mGetResult : Array.from(mGetResult);

    // Process each result
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      const serializedShoot = serializedShoots[i];

      if (serializedShoot) {
        try {
          const shootString = typeof serializedShoot === 'string'
            ? serializedShoot
            : String(serializedShoot);

          const shoot = this.deserializeShoot(shootString);

          // Check if the shoot has expired
          if (new Date() <= shoot.expiresAt) {
            result.set(code, shoot);
          } else {
            // Clean up expired shoot
            await this.deleteShoot(code);
          }
        } catch (error) {
          console.error(`Error deserializing shoot ${code}:`, error);
        }
      }
    }

    return result;
  }

  /**
   * Gets an array of string values from Redis, handling Buffer conversion
   * @param key The Redis key for a set
   * @returns Array of string values
   */
  private async getStringArrayFromRedis(key: string): Promise<string[]> {
    const client = await getRedisClient({ url: this.redisConfig.redisUrl });
    const values = await client.sMembers(key);

    // Convert to array if needed
    const valueArray = Array.isArray(values) ? values : Array.from(values);

    // Convert each value to string if needed
    return valueArray.map((value: unknown) => typeof value === 'string' ? value : String(value));
  }

  /**
   * Gets a string value from Redis, handling Buffer conversion
   * @param key The Redis key
   * @returns The string value or null if not found
   */
  private async getStringFromRedis(key: string): Promise<string | null> {
    const client = await getRedisClient({ url: this.redisConfig.redisUrl });
    const value = await client.get(key);

    if (!value) {
      return null;
    }

    return typeof value === 'string' ? value : String(value);
  }
}