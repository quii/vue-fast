import express, { Router } from 'express'
import backupRoutes from './backup.js'
import { S3Service } from '../services/s3Service.js'

const router: Router = express.Router()

// Basic health check
router.get('/health', (req, res) => {
  res.json({
    status: 'API is running',
    environment: process.env.NODE_ENV,
    s3Endpoint: process.env.S3_ENDPOINT || 'not set',
    s3BucketName: process.env.S3_BUCKET_NAME || 'not set'
  })
})

// Add a diagnostic endpoint
router.get('/diagnose', async (req, res) => {
  try {
    const s3Service = new S3Service()

    // Test environment variables
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      S3_ENDPOINT: process.env.S3_ENDPOINT,
      S3_REGION: process.env.S3_REGION,
      S3_ACCESS_KEY: process.env.S3_ACCESS_KEY ? '[REDACTED]' : 'not set',
      S3_SECRET_KEY: process.env.S3_SECRET_KEY ? '[REDACTED]' : 'not set',
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME
    }

    // Test S3 connection
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
// Mount backup routes
router.use('/', backupRoutes)

export default router