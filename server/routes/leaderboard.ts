import express, { Router, Request, Response } from 'express'
import { ShootRepository } from '../../shared/ports/ShootRepository.js'
import { ShootService } from '../../shared/ports/ShootService.js'
import { ShootServiceImpl } from '../../shared/services/ShootServiceImpl.js'
import { WebSocketManager } from '../services/WebSocketManager.js'
import { Shoot } from '../../shared/models/Shoot.js'

// Export a function that creates the router with injected dependencies
export function createLeaderboardRouter(dependencies: {
  shootService: ShootService
}): Router {
  const { shootService } = dependencies
  const router: Router = express.Router()

  // Health check endpoint
  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      message: 'Leaderboard API is running'
    })
  })

  // Create a new shoot
  router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
      const { creatorName } = req.body

      if (!creatorName) {
        res.status(400).json({
          success: false,
          error: 'Creator name is required'
        })
        return
      }

      const result = await shootService.createShoot(creatorName)

      res.json({
        success: true,
        code: result.code,
        shoot: result.shoot
      })
    } catch (error) {
      console.error('Error creating shoot:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create shoot'
      })
    }
  })

  // Get a shoot by code
  router.get('/:code', async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params
      const shoot = await shootService.getShoot(code)

      if (!shoot) {
        res.status(404).json({
          success: false,
          error: 'Shoot not found'
        })
        return
      }

      res.json({
        success: true,
        shoot
      })
    } catch (error) {
      console.error('Error getting shoot:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get shoot'
      })
    }
  })

  // Join a shoot
  router.post('/:code/join', async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params
      const { archerName, roundName } = req.body

      if (!archerName || !roundName) {
        res.status(400).json({
          success: false,
          error: 'Archer name and round name are required'
        })
        return
      }

      const result = await shootService.joinShoot(code, archerName, roundName)

      if (!result.success) {
        res.status(404).json({
          success: false,
          error: 'Shoot not found or join failed'
        })
        return
      }

      res.json(result)
    } catch (error) {
      console.error('Error joining shoot:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to join shoot'
      })
    }
  })

  // Update score
  router.put('/:code/score', async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params
      const { archerName, totalScore, roundName, arrowsShot, currentClassification, scores } = req.body

      if (!archerName || totalScore === undefined || !roundName || arrowsShot === undefined) {
        res.status(400).json({
          success: false,
          error: 'Archer name, total score, round name, and arrows shot are required'
        })
        return
      }

      // Validate that arrowsShot is a non-negative number
      if (typeof arrowsShot !== 'number' || arrowsShot < 0) {
        res.status(400).json({
          success: false,
          error: 'Arrows shot must be a non-negative number'
        })
        return
      }

      // Validate that totalScore is a number
      if (typeof totalScore !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Total score must be a number'
        })
        return
      }

      const result = await shootService.updateScore(code, archerName, totalScore, roundName, arrowsShot, currentClassification, scores)

      if (!result.success) {
        res.status(404).json({
          success: false,
          error: 'Shoot not found or archer not found'
        })
        return
      }

      res.json(result)
    } catch (error) {
      console.error('Error updating score:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update score'
      })
    }
  })

  // Finish shoot - new endpoint
  router.put('/:code/finish', async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params
      const { archerName, totalScore, roundName, arrowsShot, currentClassification, scores } = req.body

      if (!archerName || totalScore === undefined || !roundName || arrowsShot === undefined) {
        res.status(400).json({
          success: false,
          error: 'Archer name, total score, round name, and arrows shot are required'
        })
        return
      }

      // Validate that arrowsShot is a non-negative number
      if (typeof arrowsShot !== 'number' || arrowsShot < 0) {
        res.status(400).json({
          success: false,
          error: 'Arrows shot must be a non-negative number'
        })
        return
      }

      // Validate that totalScore is a number
      if (typeof totalScore !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Total score must be a number'
        })
        return
      }

      const result = await shootService.finishShoot(code, archerName, totalScore, roundName, arrowsShot, currentClassification, scores)

      if (!result.success) {
        res.status(404).json({
          success: false,
          error: 'Shoot not found or archer not found'
        })
        return
      }

      res.json(result)
    } catch (error) {
      console.error('Error finishing shoot:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to finish shoot'
      })
    }
  })

  // Leave a shoot
  router.delete('/:code/archer/:archerName', async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, archerName } = req.params

      const result = await shootService.leaveShoot(code, archerName)

      if (!result.success) {
        res.status(404).json({
          success: false,
          error: 'Shoot not found or archer not found'
        })
        return
      }

      res.json(result)
    } catch (error) {
      console.error('Error leaving shoot:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to leave shoot'
      })
    }
  })

  return router
}