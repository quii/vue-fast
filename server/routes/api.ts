import express, { Router } from 'express'
import { S3Service } from '../services/s3Service.js'
import { createBackupRouter } from './backup.js'
import { createLeaderboardRouter } from './leaderboard.js'
import { ShootService } from '../../shared/ports/ShootService.js'


export function createApiRouter(dependencies: {
  s3Service: S3Service,
  shootService: ShootService,
}): Router {
  const { s3Service, shootService } = dependencies
  const router: Router = express.Router()

  router.get('/health', (req, res) => {
    res.json({
      status: 'API is running',
      environment: process.env.NODE_ENV,
      s3Endpoint: process.env.S3_ENDPOINT || 'not set',
      s3BucketName: process.env.S3_BUCKET_NAME || 'not set'
    })
  })

  router.get('/diagnose', async (req, res) => {
    try {
      const envInfo = {
        NODE_ENV: process.env.NODE_ENV,
        S3_ENDPOINT: process.env.S3_ENDPOINT,
        S3_REGION: process.env.S3_REGION,
        S3_ACCESS_KEY: process.env.S3_ACCESS_KEY ? '[REDACTED]' : 'not set',
        S3_SECRET_KEY: process.env.S3_SECRET_KEY ? '[REDACTED]' : 'not set',
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME
      }

      let s3ConnectionStatus = 'unknown'
      try {
        await s3Service.initializeBucket()
        s3ConnectionStatus = 'success'
      } catch (error: any) {
        s3ConnectionStatus = `failed: ${error.message}`
      }

      res.json({
        status: 'diagnostic complete',
        environment: envInfo,
        s3Connection: s3ConnectionStatus
      })
    } catch (error: any) {
      res.status(500).json({
        status: 'diagnostic failed',
        error: error.message
      })
    }
  })

  router.get('/list-all-backups', async (req, res) => {
    try {
      const result = await s3Service.listAllBackups()

      res.json({
        success: true,
        count: result.length,
        backups: result
      })
    } catch (error: any) {
      console.error('Error listing all backups:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  })

  router.delete('/delete-test-backups', async (req, res) => {
    try {
      const result = await s3Service.deleteTestData()

      res.json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} test backup(s)`,
        ...result
      })
    } catch (error: any) {
      console.error('Error in delete-test-backups endpoint:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete test backups',
        error: error.message
      })
    }
  })


  const backupRouter = createBackupRouter({ s3Service })
  // router.use('/', backupRouter)  // For backward compatibility
  router.use('/backups', backupRouter)  // New path
  router.use('/shoots', createLeaderboardRouter({ shootService, }))

  return router
}