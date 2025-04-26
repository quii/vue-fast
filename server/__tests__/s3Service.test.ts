import { S3Service } from '../services/s3Service.js'
import { GenericContainer, StartedTestContainer } from 'testcontainers'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('S3Service Integration Tests', () => {
  let container: StartedTestContainer
  let s3Service: S3Service
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

    // Initialize S3 service with test container
    s3Service = new S3Service({
      endpoint,
      region: 'us-east-1',
      accessKey: 'minioadmin',
      secretKey: 'minioadmin',
      bucketName: testBucketName
    })

    // Create the test bucket
    await s3Service.initializeBucket()
  }, 30000) // Increase timeout for container startup

  afterAll(async () => {
    // Stop the container after tests
    if (container) {
      await container.stop()
    }
  })

  it('should store and retrieve a backup', async () => {
    // Test data
    const userName = 'test-user'
    const deviceId = 'test-device-123'
    const testData = {
      history: [{ id: 1, score: 100 }],
      notes: [{ id: 1, text: 'Test note' }],
      user: { name: userName, ageGroup: 'Senior' }
    }

    // Store backup
    const { key } = await s3Service.storeBackup(userName, deviceId, testData)

    // Retrieve backup
    const retrievedData = await s3Service.getBackup(key)

    // Verify data
    expect(retrievedData).toEqual(testData)
  })

  it('should list backups by device ID', async () => {
    // Test data
    const userName = 'test-user'
    const deviceId = 'test-device-456'
    const testData = {
      history: [{ id: 2, score: 200 }],
      user: { name: userName }
    }

    // Store multiple backups
    await s3Service.storeBackup(userName, deviceId, testData)
    await s3Service.storeBackup(userName, deviceId, { ...testData, updated: true })

    // List backups
    const backups = await s3Service.listBackupsByDevice(deviceId)

    // Verify backups
    expect(backups.length).toBeGreaterThanOrEqual(2)
    expect(backups[0].deviceId).toBe(deviceId)
    expect(backups[0].userName).toBe(userName)
  })

  it('should find backups by user name', async () => {
    // Test data
    const userName = 'find-test-user'
    const deviceId1 = 'device-1'
    const deviceId2 = 'device-2'
    const testData = {
      history: [{ id: 3, score: 300 }],
      user: { name: userName }
    }

    // Store backups from different devices
    await s3Service.storeBackup(userName, deviceId1, testData)
    await s3Service.storeBackup(userName, deviceId2, testData)

    // Find backups by name
    const backups = await s3Service.findBackupsByName(userName)

    // Verify backups from both devices are found
    expect(backups.length).toBeGreaterThanOrEqual(2)

    // Check that we have backups from both devices
    const deviceIds = backups.map(b => b.deviceId)
    expect(deviceIds).toContain(deviceId1)
    expect(deviceIds).toContain(deviceId2)

    // All backups should have the same user name
    expect(backups.every(b => b.userName === userName)).toBe(true)
  })

  it('should rotate backups and keep only the most recent ones', async () => {
    // Test data
    const userName = 'rotation-test-user'
    const deviceId = 'rotation-device'
    const testData = { test: true }

    // Store 7 backups
    for (let i = 0; i < 7; i++) {
      await s3Service.storeBackup(userName, deviceId, { ...testData, index: i })
      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // List all backups before rotation
    const beforeRotation = await s3Service.listBackupsByDevice(deviceId)
    expect(beforeRotation.length).toBeGreaterThanOrEqual(7)

    // Rotate backups, keeping only 5
    await s3Service.rotateBackups(deviceId, 5)

    // List backups after rotation
    const afterRotation = await s3Service.listBackupsByDevice(deviceId)

    // Should have exactly 5 backups now
    expect(afterRotation.length).toBe(5)

    // The remaining backups should be the most recent ones
    const remainingIndices = await Promise.all(
      afterRotation.map(async backup => {
        const data = await s3Service.getBackup(backup.key)
        return data.index
      })
    )

    // Should have the highest indices (most recent backups)
    expect(remainingIndices.sort()).toEqual([2, 3, 4, 5, 6])
  })
})