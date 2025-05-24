import { describe, expect, it } from 'vitest'
import express from 'express'
import request from 'supertest'
import { createApiRouter } from '../routes/api.js'
import { InMemoryShootRepository } from '../../shared/services/InMemoryShootRepository.js'
import { beforeEach} from 'vitest'
import { InMemoryShootNotificationService } from '../../shared/services/InMemoryShootNotificationService'
import { ShootServiceImpl } from '../../shared/services/ShootServiceImpl'

describe('API Health Checks', () => {
  let app: express.Application

  beforeEach(() => {
    // Create a mock S3Service
    const s3Service = {
      initializeBucket: async () => {}
    } as any

    // Use in-memory repository for these simple tests
    const shootRepository = new InMemoryShootRepository()
    const notifications = new InMemoryShootNotificationService()
    const shootService = new ShootServiceImpl(shootRepository, notifications)

    // Create the Express app with the API router
    app = express()
    app.use(express.json())
    app.use('/api', createApiRouter({ s3Service, shootService }))
  })

  it('should respond to leaderboard health check', async () => {
    const response = await request(app)
      .get('/api/shoots/health')
      .expect(200)

    expect(response.body.status).toBe('ok')
    expect(response.body.message).toBe('Leaderboard API is running')
  })

  it('should respond to backup health check', async () => {
    const response = await request(app)
      .get('/api/backups/health')
      .expect(200)

    expect(response.body.status).toBe('ok')
  })
})