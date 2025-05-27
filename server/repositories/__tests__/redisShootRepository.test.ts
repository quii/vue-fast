import { RedisShootRepository } from '../RedisShootRepository.js';
import { ShootRepositoryContract } from '../../../shared/services/__tests__/ShootRepositoryContract.js';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { describe, beforeAll, afterAll, beforeEach, it, expect } from 'vitest';
import { closeRedisClient } from '../../services/redisClient'

describe('RedisShootRepository', () => {
  let container: StartedTestContainer;
  let redisUrl: string;
  let repository: RedisShootRepository;

  beforeAll(async () => {
    // Start a Redis container for testing
    container = await new GenericContainer('redis:6')
      .withExposedPorts(6379)
      .start();

    redisUrl = `redis://${container.getHost()}:${container.getMappedPort(6379)}`;
    console.log(`Redis test container running at ${redisUrl}`);

    repository = new RedisShootRepository({ redisUrl });
  }, 30000); // Increase timeout for container startup

  afterAll(async () => {
    // Close Redis client connections
    await closeRedisClient();

    // Stop the container after tests
    if (container) {
      await container.stop();
    }
  });

  // Run the contract tests against the Redis implementation
  ShootRepositoryContract(
    'RedisShootRepository',
    async () => {
      // Clear any existing data
      await repository.clear();
      return repository;
    },
    async () => {
      // No additional cleanup needed as container will be stopped
    }
  );
});
