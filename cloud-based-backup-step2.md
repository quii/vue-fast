# Shared Leaderboard Implementation - Step 2

## Backend API endpoints and Redis integration (implement a driven, persistence adapter)

This document outlines the implementation plan for the second milestone of the shared leaderboard feature: creating the persistence adapter using Redis and exposing API endpoints.

## Redis Adapter Implementation

Now that we have properly separated the domain logic from persistence with the `ShootRepository` interface, we'll implement a Redis-based repository:

1. **RedisShootRepository**
    - Implements the `ShootRepository` interface
    - Uses Redis for persistent storage
    - Handles serialization/deserialization of shoot data
    - Manages expiration of shoots

### Key Design Decisions

1. **Redis Key Structure**:
    - `shoots:{code}` - For storing the main shoot data
    - `shoots:active` - Set of active shoot codes for cleanup/management

2. **Data Serialization**:
    - JSON serialization for shoot data
    - Special handling for Date objects during serialization/deserialization

3. **Expiration Handling**:
    - Set TTL on Redis keys to match the shoot expiration time
    - Automatic cleanup via Redis expiration

4. **Concurrency Handling**:
    - Use Redis transactions where appropriate to ensure data consistency
    - Implement optimistic locking for score updates

## API Endpoints

The following API endpoints will be implemented:

1. **POST /api/shoots**
    - Create a new shoot
    - Request body: `{ creatorName: string }`
    - Response: `{ success: boolean, code: string, shoot: Shoot }`

2. **POST /api/shoots/:code/join**
    - Join an existing shoot
    - Request body: `{ archerName: string, roundName: string }`
    - Response: `{ success: boolean, shoot: Shoot }`

3. **PUT /api/shoots/:code/score**
    - Update an archer's score
    - Request body: `{ archerName: string, totalScore: number, roundName: string }`
    - Response: `{ success: boolean, shoot: Shoot }`

4. **DELETE /api/shoots/:code/archer/:archerName**
    - Leave a shoot
    - Response: `{ success: boolean }`

5. **GET /api/shoots/:code**
    - Get the current state of a shoot
    - Response: `{ success: boolean, shoot: Shoot }`

## Dependency Injection

Following the pattern in `server/routes/api.ts`:

```typescript
export function createApiRouter(dependencies: { 
   s3Service: S3Service,
   shootRepository: ShootRepository 
}) {
   const { s3Service, shootRepository } = dependencies;
   const router: Router = express.Router();
  
   // Existing routes...
  
   router.use('/shoots', createLeaderboardRouter({ shootRepository }));
  
   return router;
}
```

The `shootRepository` will be instantiated in `server/index.ts`:

```typescript
// For development
const shootRepository = new InMemoryShootRepository();

// For production
const shootRepository = new RedisShootRepository({
   redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
});
```

## Local Development Setup

Following the pattern used for MinIO in the project, we'll:

1. **Create a Redis Ensure Script**
    - Create a script similar to `scripts/ensure-minio.js` called `scripts/ensure-redis.js`
    - This script will check if a Redis container is running and start one if needed
    - It will use the same Docker API approach as the MinIO script

2. **Update Package Scripts**
    - Add a new script to package.json: `"redis:ensure": "node scripts/ensure-redis.js"`
    - Update the `dev:all` script to include Redis:
      ```json
      "dev:all": "concurrently \"npm run minio:ensure\" \"npm run redis:ensure\" \"npm run dev\" \"npm run server:build:watch\" \"npm run server:start\"",
      ```

3. **Environment Configuration**
    - Update environment variables to include Redis configuration
    - Support both local development and production environments

## Testing Strategy

1. **Repository Contract Tests**
    - Use the existing `ShootRepositoryContract` to test the Redis implementation
    - This ensures the Redis implementation behaves the same as the in-memory one

2. **Integration Tests**
    - Test with a real Redis instance using testcontainers
    - Follow the pattern in `server/__tests__/s3Service.test.ts`
    - Spin up a Redis container for testing
    - Verify data persistence and retrieval
    - Test expiration behavior

3. **API Tests**
    - Test the API endpoints with supertest
    - Verify correct responses and error handling
    - Test with a Redis container for full integration testing

## Example Redis Repository Test

```typescript
import { RedisShootRepository } from '../RedisShootRepository.js';
import { ShootRepositoryContract } from './ShootRepositoryContract.js';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { describe, beforeAll, afterAll } from 'vitest';

describe('RedisShootRepository', () => {
   let container: StartedTestContainer;
  
   beforeAll(async () => {
     // Start a Redis container for testing
     container = await new GenericContainer('redis:6')
       .withExposedPorts(6379)
       .start();
   }, 30000);
  
   afterAll(async () => {
     // Stop the container after tests
     if (container) {
       await container.stop();
     }
   });
  
   // Run the contract tests against the Redis implementation
   ShootRepositoryContract(
     'RedisShootRepository',
     async () => {
       const redisUrl = `redis://${container.getHost()}:${container.getMappedPort(6379)}`;
       const repository = new RedisShootRepository({ redisUrl });
       // Clear any existing data
       await repository.clear();
       return repository;
     },
     async () => {
       // No additional cleanup needed as container will be stopped
     }
   );
  
   // Additional Redis-specific tests can go here
});
```

This approach ensures:
1. Clean separation between domain logic and persistence
2. Type safety through TypeScript
3. Testability at all levels
4. Compatibility with both development and production environments
5. Adherence to the hexagonal architecture principles
6. Proper integration with the existing codebase structure
8. Consistent local development experience with the existing setup8. Consistent local development experience with the existing setup8. Consistent local development experience with the existing setup7. Comprehensive testing using the established patterns5. Adherence to the hexagonal architecture principles