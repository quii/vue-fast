import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
// Use .js extension because that's what it will be at runtime
import apiRoutes from './routes/api.js'

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Add explicit type annotation
const app: express.Application = express()
const PORT = process.env.PORT || 8080
const isDevelopment = process.env.NODE_ENV === 'development'

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API routes
app.use('/api', apiRoutes)

// In production, serve static files and handle SPA routing
if (!isDevelopment) {
  console.log('Running in production mode, serving static files')
  // Serve static files from the Vue app build directory
  app.use(express.static(path.join(__dirname, '../../dist')))

  // Handle SPA routing - send all non-API requests to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'))
  })
} else {
  console.log('Running in development mode, API only')
}

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong on the server'
  })
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api`)
})

export default app