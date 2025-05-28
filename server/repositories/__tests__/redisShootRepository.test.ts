import { RedisShootRepository } from '../RedisShootRepository.js';
import { ShootRepositoryContract } from '../../../shared/services/__tests__/ShootRepositoryContract.js';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { describe, beforeAll, afterAll } from 'vitest';

describe('RedisShootRepository', () => {
  let container: StartedTestContainer;
  let redisUrl: string;
  let repository: RedisShootRepository;

  beforeAll(async () => {
    console.log('🚀 Starting Redis container...')

    // Use EXACTLY the same pattern as leaderboardApi.test.ts
    container = await new GenericContainer('redis:6.2')
      .withExposedPorts(6379)
      .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
      .withStartupTimeout(30000)
      .start()

    const host = container.getHost()
    const port = container.getMappedPort(6379)
    redisUrl = `redis://${host}:${port}`

    console.log(`📍 Redis container ready at: ${redisUrl}`)

    // Copy the EXACT retry logic from leaderboardApi.test.ts
    console.log('🧪 Testing Redis connection with retries...')
    const Redis = require('ioredis') // <-- Use require like the working test
    let connected = false
    let attempts = 0
    const maxAttempts = 10

    while (!connected && attempts < maxAttempts) {
      attempts++
      console.log(`   Attempt ${attempts}/${maxAttempts}`)

      const testClient = new Redis(redisUrl, {
        connectTimeout: 5000,
        lazyConnect: true,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 1
      })

      try {
        await testClient.connect()
        const result = await testClient.ping()
        console.log(`✅ Redis ping successful: ${result}`)
        await testClient.quit()
        connected = true
      } catch (error) {
        console.log(`   ❌ Attempt ${attempts} failed: ${error.message}`)
        try {
          await testClient.quit()
        } catch (e) {
          // Ignore cleanup errors
        }

        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    if (!connected) {
      throw new Error('Failed to connect to Redis after multiple attempts')
    }

    // Now create our repository
    console.log('🏗️ Creating repository...')
    repository = new RedisShootRepository({ redisUrl })

    // Test repository connection
    try {
      await repository.codeExists('test-connection')
      console.log('✅ Repository connection successful')
    } catch (error) {
      console.error('❌ Repository connection failed:', error)
      throw error
    }
  }, 90000) // Same timeout as leaderboardApi.test.ts

  afterAll(async () => {
    // Close the repository's Redis connection
    if (repository) {
      try {
        await repository.close()
      } catch (error) {
        console.warn('Error closing repository:', error)
      }
    }

    // Stop the container
    if (container) {
      try {
        await container.stop()
      } catch (error) {
        console.warn('Error stopping container:', error)
      }
    }
  })

  // Run the contract tests
  ShootRepositoryContract(
    'RedisShootRepository',
    async () => {
      await repository.clear();
      return repository;
    }
  );
});
