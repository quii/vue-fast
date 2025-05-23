import express, { Request, Response, NextFunction, Application } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import fs from 'fs'
import { S3Service } from './services/s3Service.js'
import { createApiRouter } from './routes/api.js'
import { closeRedisClient } from './services/redisClient.js'

// Load environment variables at the very beginning
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app: Application = express()
const PORT = process.env.PORT || 8080

const s3Service = new S3Service()
s3Service.initializeBucket().catch(console.error)

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// API routes - pass the s3Service as a dependency
app.use('/api', createApiRouter({ s3Service }))

// Determine the correct static directory
// In Docker, the files are at /app/dist
// In development, they're at ../dist relative to server/index.js
let staticDir = path.join(__dirname, '../dist')

// Check if we're in Docker (look for /app directory)
if (fs.existsSync('/app/dist')) {
  staticDir = '/app/dist'
}

// Log the static directory for debugging
console.log('Static directory:', staticDir)
console.log('Directory exists:', fs.existsSync(staticDir))

// Serve static files from the Vue app build directory
app.use(express.static(staticDir))

// Handle SPA routing - send all requests to index.html
app.get('*', (req, res, next) => {
  const indexPath = path.join(staticDir, 'index.html')

  // Check if the file exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    // If file doesn't exist, log error and send 404
    console.error(`Index file not found at ${indexPath}`)
    console.log('Directory contents:', fs.readdirSync(staticDir))
    next(new Error(`Index file not found at ${indexPath}`))
  }
})

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err)
  console.error('Error Stack:', err.stack)

  // Include more details in development mode
  if (process.env.NODE_ENV !== 'production') {
    return res.status(500).json({
      error: 'Something went wrong!',
      message: err.message,
      stack: err.stack
    })
  }

  res.status(500).json({ error: 'Something went wrong!' })
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Add graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');

  // Close Redis connection
  await closeRedisClient();

  // Exit the process
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');

  // Close Redis connection
  await closeRedisClient();

  // Exit the process
  process.exit(0);
});

export default app