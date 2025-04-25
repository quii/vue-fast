import express, { Router, Request, Response } from 'express'
import { S3Service } from '../services/s3Service.js'

const router: Router = express.Router()
const s3Service = new S3Service()

// Initialize S3 bucket
s3Service.initializeBucket().catch(console.error)

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Hello from the backup API!'
  })
})

// Store backup
router.post('/backup/:deviceId', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params
    const { data, userName } = req.body

    if (!deviceId || !data) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    // Use provided userName or 'unknown'
    const userNameToStore = userName || 'unknown'

    // Store the backup
    const result = await s3Service.storeBackup(userNameToStore, deviceId, data)

    // Rotate old backups (keep only the most recent 5)
    await s3Service.rotateBackups(deviceId, 5)

    res.json({
      success: true,
      message: 'Backup stored successfully',
      ...result
    })
  } catch (error) {
    console.error('Error storing backup:', error)
    res.status(500).json({ error: 'Failed to store backup' })
  }
})

// List backups for a device
router.get('/backups/:deviceId', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params
    const backups = await s3Service.listBackupsByDevice(deviceId)

    res.json({
      backups: backups.slice(0, 5) // Return only the 5 most recent
    })
  } catch (error) {
    console.error('Error listing backups:', error)
    res.status(500).json({ error: 'Failed to list backups' })
  }
})

// Find backups by user name (for cross-device recovery)
router.get('/find-backups', async (req: Request, res: Response) => {
  try {
    const { name } = req.query

    if (!name) {
      return res.status(400).json({ error: 'Name parameter is required' })
    }

    const backups = await s3Service.findBackupsByName(String(name))

    res.json({
      backups: backups.slice(0, 10) // Limit to 10 most recent backups
    })
  } catch (error) {
    console.error('Error finding backups:', error)
    res.status(500).json({
      error: 'Failed' +
        ' to find backups'
    })
  }
})

// Get a specific backup
router.get('/backup/:key(*)', async (req: Request, res: Response) => {
  try {
    const key = req.params.key
    console.log('Retrieving backup with key:', key)

    const data = await s3Service.getBackup(key)

    res.json({
      success: true,
      data
    })
  } catch (error: unknown) {
    console.error('Error retrieving backup:', error)

    // Type guard for error with message property
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)

    // More detailed error response
    res.status(500).json({
      error: 'Failed to retrieve backup',
      message: errorMessage,
      key: req.params.key
    })
  }
})

export default router