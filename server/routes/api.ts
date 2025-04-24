import express from 'express'

// Add explicit type annotation
const router: express.Router = express.Router()

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Hello from the backup API!'
  })
})

export default router