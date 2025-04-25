import express, { Request, Response, NextFunction, Application } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import apiRoutes from './routes/api.js'
import fs from 'fs'

// Load environment variables at the very beginning
dotenv.config()

// Log environment variables for debugging (redact sensitive info)
console.log('Environment:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('S3_ENDPOINT:', process.env.S3_ENDPOINT)
console.log('S3_REGION:', process.env.S3_REGION)
console.log('S3_ACCESS_KEY:', process.env.S3_ACCESS_KEY ? '[REDACTED]' : 'undefined')
console.log('S3_SECRET_KEY:', process.env.S3_SECRET_KEY ? '[REDACTED]' : 'undefined')
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app: Application = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// API routes
app.use('/api', apiRoutes)

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

export default app