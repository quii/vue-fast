import { GenericContainer, StartedTestContainer } from 'testcontainers'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import express from 'express'
import request from 'supertest'
import { S3Service } from '../services/s3Service.js'
import { createBackupRouter } from '../routes/backup.js'

// Define interfaces for our backup objects
interface BackupMetadata {
  key: string;
  userName: string;
  deviceId: string;
  timestamp: string;
  size?: number;
  lastModified?: Date;
}

interface BackupData {
  index?: number;

  [key: string]: any;
}

describe('Backup API Integration Tests', () => {
  let container: StartedTestContainer
  let app: express.Application
  let testS3Service: S3Service
  const testBucketName = 'test-bucket'

  beforeAll(async () => {
    // Start a MinIO container for testing
    container = await new GenericContainer('minio/minio')
      .withExposedPorts(9000)
      .withEnvironment({
        MINIO_ROOT_USER: 'minioadmin',
        MINIO_ROOT_PASSWORD: 'minioadmin'
      })
      .withCommand(['server', '/data'])
      .start()

    const endpoint = `http://${container.getHost()}:${container.getMappedPort(9000)}`

    // Set environment variables for the S3 service
    process.env.AWS_ENDPOINT_URL_S3 = endpoint
    process.env.AWS_REGION = 'us-east-1'
    process.env.AWS_ACCESS_KEY_ID = 'minioadmin'
    process.env.AWS_SECRET_ACCESS_KEY = 'minioadmin'
    process.env.BUCKET_NAME = testBucketName

    // Create a test S3 service for setup/verification
    testS3Service = new S3Service({
      endpoint,
      region: 'us-east-1',
      accessKey: 'minioadmin',
      secretKey: 'minioadmin',
      bucketName: testBucketName
    })

    // Initialize bucket
    await testS3Service.initializeBucket()

    // Create Express app for testing
    app = express()
    app.use(express.json())

    // Create a router with a new S3Service instance that explicitly uses the test configuration
    const s3ServiceForRoutes = new S3Service({
      endpoint,
      region: 'us-east-1',
      accessKey: 'minioadmin',
      secretKey: 'minioadmin',
      bucketName: testBucketName
    })

    // Initialize the bucket for the router's S3 service
    await s3ServiceForRoutes.initializeBucket()

    // Use our actual router implementation with dependency injection
    const backupRouter = createBackupRouter({ s3Service: s3ServiceForRoutes })
    app.use('/api', backupRouter)
  }, 30000) // Increase timeout for container startup

  afterAll(async () => {
    // Stop the container after tests
    if (container) {
      await container.stop()
    }
  })

  it('should return health check status', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('status', 'ok')
    expect(response.body).toHaveProperty('message', 'Hello from the backup API!')
  })

  it('should store a backup and return success', async () => {
    const deviceId = 'test-device-123'
    const userName = 'test-user'
    const testData = {
      history: [{ id: 1, score: 100 }],
      notes: [{ id: 1, text: 'Test note' }],
      user: { name: userName }
    }

    const response = await request(app)
      .post(`/api/backup/${deviceId}`)
      .send({ data: testData, userName })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty('key')
    expect(response.body).toHaveProperty('timestamp')

    // Verify the backup was actually stored
    const key = response.body.key
    const storedData = await testS3Service.getBackup(key)
    expect(storedData).toEqual(testData)
  })

  it('should list backups for a device', async () => {
    const deviceId = 'test-device-456'
    const userName = 'test-user'
    const testData = {
      history: [{ id: 2, score: 200 }],
      user: { name: userName }
    }

    // Store multiple backups
    await testS3Service.storeBackup(userName, deviceId, testData)
    await testS3Service.storeBackup(userName, deviceId, { ...testData, updated: true })

    // Get the list of backups
    const response = await request(app).get(`/api/backups/${deviceId}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('backups')
    expect(Array.isArray(response.body.backups)).toBe(true)
    expect(response.body.backups.length).toBeGreaterThanOrEqual(2)

    // Check backup properties
    const backup = response.body.backups[0]
    expect(backup).toHaveProperty('key')
    expect(backup).toHaveProperty('userName', userName)
    expect(backup).toHaveProperty('deviceId', deviceId)
    expect(backup).toHaveProperty('timestamp')
  })

  it('should find backups by user name', async () => {
    const userName = 'find-test-user'
    const deviceId1 = 'device-1'
    const deviceId2 = 'device-2'
    const testData = {
      history: [{ id: 3, score: 300 }],
      user: { name: userName }
    }

    // Store backups from different devices
    await testS3Service.storeBackup(userName, deviceId1, testData)
    await testS3Service.storeBackup(userName, deviceId2, testData)

    // Find backups by name
    const response = await request(app).get(`/api/find-backups?name=${encodeURIComponent(userName)}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('backups')
    expect(Array.isArray(response.body.backups)).toBe(true)
    expect(response.body.backups.length).toBeGreaterThanOrEqual(2)

    // Check that we have backups from both devices
    const deviceIds = response.body.backups.map((b: BackupMetadata) => b.deviceId)
    expect(deviceIds).toContain(deviceId1)
    expect(deviceIds).toContain(deviceId2)

    // All backups should have the same user name
    expect(response.body.backups.every((b: BackupMetadata) => b.userName === userName)).toBe(true)
  })

  it('should retrieve a specific backup by key', async () => {
    const userName = 'retrieve-test-user'
    const deviceId = 'retrieve-device'
    const testData = {
      history: [{ id: 4, score: 400 }],
      user: { name: userName }
    }

    // Store a backup
    const { key } = await testS3Service.storeBackup(userName, deviceId, testData)

    // Retrieve the backup
    const response = await request(app).get(`/api/backup/${key}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty('data')
    expect(response.body.data).toEqual(testData)
  })

  it('should rotate backups and keep only the most recent ones', async () => {
    const userName = 'rotation-api-test-user'
    const deviceId = 'rotation-api-device'
    const testData = { test: true }

    // Store 7 backups
    for (let i = 0; i < 7; i++) {
      await request(app)
        .post(`/api/backup/${deviceId}`)
        .send({
          data: { ...testData, index: i },
          userName
        })

      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // List backups after rotation (should only have 5)
    const response = await request(app).get(`/api/backups/${deviceId}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('backups')
    expect(response.body.backups.length).toBe(5)

    // The remaining backups should be the most recent ones
    const keys = response.body.backups.map((b: BackupMetadata) => b.key)

    // Retrieve each backup to check its index
    const indices = await Promise.all(
      keys.map(async (key: string) => {
        const backupResponse = await request(app).get(`/api/backup/${key}`)
        return backupResponse.body.data.index
      })
    )

    // Should have the highest indices (most recent backups)
    expect(indices.sort()).toEqual([2, 3, 4, 5, 6])
  })

  it('should handle errors when backup key is not found', async () => {
    const nonExistentKey = 'backups/non-existent-user/non-existent-device/2023-01-01T00:00:00.000Z.json'

    const response = await request(app).get(`/api/backup/${nonExistentKey}`)

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('error')
  })

  it('should handle missing parameters in backup request', async () => {
    const deviceId = 'test-device'

    // Missing data
    const response = await request(app)
      .post(`/api/backup/${deviceId}`)
      .send({ userName: 'test-user' })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  it('should handle missing name parameter in find-backups request', async () => {
    const response = await request(app).get('/api/find-backups')

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  // Add a test for the delete-test-backups endpoint
  it('should delete test data backups', async () => {
    // First create some test data
    const testUserName = 'Test Archer'
    const deviceId = 'test-device-delete'
    const testData = { test: true }

    // Store a few test backups
    await testS3Service.storeBackup(testUserName, deviceId, testData)
    await testS3Service.storeBackup('anonymous', deviceId, testData)

    // Also store a regular backup that shouldn't be deleted
    await testS3Service.storeBackup('regular-user', deviceId, testData)

    // Call the delete endpoint
    const response = await request(app).delete('/api/delete-test-backups')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty('deletedCount')
    expect(response.body.deletedCount).toBeGreaterThanOrEqual(2) // Should delete at least the 2 test backups

    // Verify that test backups are gone but regular backups remain
    const allBackups = await testS3Service.listAllBackups()
    const testBackups = allBackups.filter(b =>
      b.userName.toLowerCase() === 'anonymous' ||
      b.userName.toLowerCase().includes('test archer')
    )

    expect(testBackups.length).toBe(0) // All test backups should be gone

    // Should still have the regular backup
    const regularBackups = allBackups.filter(b => b.userName === 'regular-user')
    expect(regularBackups.length).toBeGreaterThan(0)
  })
})