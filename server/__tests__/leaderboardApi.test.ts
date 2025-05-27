import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { GenericContainer, StartedTestContainer } from 'testcontainers'
import express from 'express'
import request from 'supertest'
import { createApiRouter } from '../routes/api.js'
import { S3Service } from '../services/s3Service.js'
import { RedisShootRepository } from '../repositories/RedisShootRepository.js'
import { closeRedisClient } from '../services/redisClient.js'
import { InMemoryShootNotificationService } from '../../shared/services/InMemoryShootNotificationService'
import { ShootServiceImpl } from '../../shared/services/ShootServiceImpl'

describe('Leaderboard API Integration Tests', () => {
  let redisContainer: StartedTestContainer
  let app: express.Application
  let redisUrl: string
  let shootRepository: RedisShootRepository
  let createdShootCode: string

  beforeAll(async () => {
    // Start a Redis container for testing
    redisContainer = await new GenericContainer('redis:6')
      .withExposedPorts(6379)
      .start()

    redisUrl = `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`
    console.log(`Redis test container running at ${redisUrl}`)

    // Create the repository with the test container
    shootRepository = new RedisShootRepository({ redisUrl })

    // Create a proper instance of S3Service with minimal configuration
    const s3Service = new S3Service({
      endpoint: 'http://localhost:9000',
      region: 'us-east-1',
      accessKey: 'minioadmin',
      secretKey: 'minioadmin',
      bucketName: 'test-bucket'
    })

    // Mock the methods we don't want to actually call
    s3Service.initializeBucket = async () => {}

    const notifications = new InMemoryShootNotificationService()
    const shootService = new ShootServiceImpl(shootRepository, notifications)

    // Create the Express app with the API router
    app = express()
    app.use(express.json())
    app.use('/api', createApiRouter({ s3Service, shootService }))
  }, 30000) // Increase timeout for container startup

  afterAll(async () => {
    // Close Redis client connections
    await closeRedisClient()

    // Stop the container after tests
    if (redisContainer) {
      await redisContainer.stop()
    }
  })

  it('should create a new shoot', async () => {
    const response = await request(app)
      .post('/api/shoots')
      .send({ creatorName: 'Test Creator' })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.code).toMatch(/^\d{4}$/)
    expect(response.body.shoot.creatorName).toBe('Test Creator')
    expect(response.body.shoot.participants).toHaveLength(0)

    // Save the code for later tests
    createdShootCode = response.body.code
  })

  it('should get a shoot by code', async () => {
    const response = await request(app)
      .get(`/api/shoots/${createdShootCode}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.shoot.code).toBe(createdShootCode)
    expect(response.body.shoot.creatorName).toBe('Test Creator')
  })

  it('should return 404 for non-existent shoot', async () => {
    await request(app)
      .get('/api/shoots/9999')
      .expect(404)
  })

  it('should allow an archer to join a shoot', async () => {
    const response = await request(app)
      .post(`/api/shoots/${createdShootCode}/join`)
      .send({ archerName: 'Test Archer', roundName: 'Windsor' })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.shoot.participants).toHaveLength(1)
    expect(response.body.shoot.participants[0].archerName).toBe('Test Archer')
    expect(response.body.shoot.participants[0].roundName).toBe('Windsor')
    expect(response.body.shoot.participants[0].totalScore).toBe(0)
  })

  it('should update an archer\'s score', async () => {
    const response = await request(app)
      .put(`/api/shoots/${createdShootCode}/score`)
      .send({
        archerName: 'Test Archer',
        totalScore: 42,
        roundName: 'Windsor',
        arrowsShot: 12
      })
      .expect(200)

    expect(response.body.success).toBe(true)

    const archer = response.body.shoot.participants.find(
      (p: any) => p.archerName === 'Test Archer'
    )

    expect(archer).toBeDefined()
    expect(archer.totalScore).toBe(42)
    expect(archer.currentPosition).toBe(1)
  })

  it('should handle multiple archers and update positions correctly', async () => {
    // Add a second archer
    await request(app)
      .post(`/api/shoots/${createdShootCode}/join`)
      .send({ archerName: 'Second Archer', roundName: 'Windsor' })
      .expect(200)

    // Update second archer's score to be higher than first
    const response = await request(app)
      .put(`/api/shoots/${createdShootCode}/score`)
      .send({
        archerName: 'Second Archer',
        totalScore: 50,
        roundName: 'Windsor',
        arrowsShot: 18
      })
      .expect(200)

    expect(response.body.success).toBe(true)

    const firstArcher = response.body.shoot.participants.find(
      (p: any) => p.archerName === 'Test Archer'
    )

    const secondArcher = response.body.shoot.participants.find(
      (p: any) => p.archerName === 'Second Archer'
    )

    expect(firstArcher.totalScore).toBe(42)
    expect(firstArcher.currentPosition).toBe(2)

    expect(secondArcher.totalScore).toBe(50)
    expect(secondArcher.currentPosition).toBe(1)
  })

  it('should allow an archer to leave a shoot', async () => {
    // First, verify we have two archers
    let response = await request(app)
      .get(`/api/shoots/${createdShootCode}`)
      .expect(200)

    expect(response.body.shoot.participants).toHaveLength(2)

    // Now have one archer leave
    response = await request(app)
      .delete(`/api/shoots/${createdShootCode}/archer/Test Archer`)
      .expect(200)

    expect(response.body.success).toBe(true)

    // Verify the archer is gone
    response = await request(app)
      .get(`/api/shoots/${createdShootCode}`)
      .expect(200)

    expect(response.body.shoot.participants).toHaveLength(1)
    expect(response.body.shoot.participants[0].archerName).toBe('Second Archer')
  })

  it('should handle validation errors', async () => {
    // Test missing creator name
    await request(app)
      .post('/api/shoots')
      .send({})
      .expect(400)

    // Test missing archer name when joining
    await request(app)
      .post(`/api/shoots/${createdShootCode}/join`)
      .send({ roundName: 'Windsor' })
      .expect(400)

    // Test missing score when updating
    await request(app)
      .put(`/api/shoots/${createdShootCode}/score`)
      .send({ archerName: 'Second Archer', roundName: 'Windsor' })
      .expect(400)

    // Test missing arrowsShot when updating
    await request(app)
      .put(`/api/shoots/${createdShootCode}/score`)
      .send({
        archerName: 'Second Archer',
        totalScore: 25,
        roundName: 'Windsor'
      })
      .expect(400)

    // Test invalid arrowsShot (negative number)
    await request(app)
      .put(`/api/shoots/${createdShootCode}/score`)
      .send({
        archerName: 'Second Archer',
        totalScore: 25,
        roundName: 'Windsor',
        arrowsShot: -5
      })
      .expect(400)

    // Test invalid arrowsShot (not a number)
    await request(app)
      .put(`/api/shoots/${createdShootCode}/score`)
      .send({
        archerName: 'Second Archer',
        totalScore: 25,
        roundName: 'Windsor',
        arrowsShot: 'invalid'
      })
      .expect(400)
  })

  it('should handle non-existent archers', async () => {
    // Try to update score for non-existent archer
    const response = await request(app)
      .put(`/api/shoots/${createdShootCode}/score`)
      .send({
        archerName: 'Non-existent Archer',
        totalScore: 100,
        roundName: 'Windsor',
        arrowsShot: 24
      })
      .expect(404)

    expect(response.body.success).toBe(false)
  })

  it('should create multiple shoots independently', async () => {
    // Create a second shoot
    const createResponse = await request(app)
      .post('/api/shoots')
      .send({ creatorName: 'Another Creator' })
      .expect(200)

    const secondShootCode = createResponse.body.code

    // Add an archer to the second shoot
    await request(app)
      .post(`/api/shoots/${secondShootCode}/join`)
      .send({ archerName: 'Unique Archer', roundName: 'National' })
      .expect(200)

    // Verify first shoot is unchanged
    const firstShootResponse = await request(app)
      .get(`/api/shoots/${createdShootCode}`)
      .expect(200)

    expect(firstShootResponse.body.shoot.participants).toHaveLength(1)
    expect(firstShootResponse.body.shoot.participants[0].archerName).toBe('Second Archer')

    // Verify second shoot has the new archer
    const secondShootResponse = await request(app)
      .get(`/api/shoots/${secondShootCode}`)
      .expect(200)

    expect(secondShootResponse.body.shoot.participants).toHaveLength(1)
    expect(secondShootResponse.body.shoot.participants[0].archerName).toBe('Unique Archer')
  })
})