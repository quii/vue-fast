import express, { Router, Request, Response } from 'express'
import { S3Service } from '../services/s3Service.js'

// Export a function that creates the router with injected dependencies
export function createBackupRouter(dependencies: { s3Service: S3Service }): Router {
  const { s3Service } = dependencies
  const router: Router = express.Router()

  // Initialize S3 bucket - we can still do this here or move it to server/index.ts
  s3Service.initializeBucket().catch(console.error)

  // Health check endpoint
  router.get('/health', (req: Request, res: Response): void => {
    res.json({
      status: 'ok',
      message: 'Hello from the backup API!'
    })
  })

  // Store backup
  router.post('/backup/:deviceId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { deviceId } = req.params
      const { data, userName } = req.body

      if (!deviceId || !data) {
        res.status(400).json({ error: 'Missing required parameters' })
        return
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
  router.get('/backups/:deviceId', async (req: Request, res: Response): Promise<void> => {
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
  router.get('/find-backups', async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.query

      if (!name) {
        res.status(400).json({ error: 'Name parameter is required' })
        return
      }

      const backups = await s3Service.findBackupsByName(String(name))

      res.json({
        backups: backups.slice(0, 10) // Limit to 10 most recent backups
      })
    } catch (error) {
      console.error('Error finding backups:', error)
      res.status(500).json({
        error: 'Failed to find backups'
      })
    }
  })

  // Get a specific backup - Using regex for Express v5 compatibility
  router.get(/^\/backup\/(.+)$/, async (req: Request, res: Response): Promise<void> => {
    try {
      const key = req.params[0]

      if (!key) {
        res.status(400).json({
          error: 'Backup key is required',
          message: 'No backup key provided in the URL'
        })
        return
      }

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
        key: req.params[0] || 'unknown'
      })
    }
  })

  // Add the delete-test-backups endpoint
  router.delete('/delete-test-backups', async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await s3Service.deleteTestData()

      res.json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} test backup(s)`,
        ...result
      })
    } catch (error) {
      console.error('Error deleting test backups:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete test backups',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  return router
}