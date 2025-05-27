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
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { creatorName } = req.body

      if (!creatorName) {
        return res.status(400).json({
          success: false,
          error: 'Creator name is required'
        })
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
  router.get('/:code', async (req: Request, res: Response) => {
    try {
      const { code } = req.params
      const shoot = await shootService.getShoot(code)

      if (!shoot) {
        return res.status(404).json({
          success: false,
          error: 'Shoot not found'
        })
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
  router.post('/:code/join', async (req: Request, res: Response) => {
    try {
      const { code } = req.params
      const { archerName, roundName } = req.body

      if (!archerName || !roundName) {
        return res.status(400).json({
          success: false,
          error: 'Archer name and round name are required'
        })
      }

      const result = await shootService.joinShoot(code, archerName, roundName)

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: 'Shoot not found or join failed'
        })
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
  router.put('/:code/score', async (req: Request, res: Response) => {
    try {
      const { code } = req.params
      const { archerName, totalScore, roundName } = req.body

      if (!archerName || totalScore === undefined || !roundName) {
        return res.status(400).json({
          success: false,
          error: 'Archer name, total score, and round name are required'
        })
      }

      const result = await shootService.updateScore(code, archerName, totalScore, roundName)

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: 'Shoot not found or archer not found'
        })
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

  // Leave a shoot
  router.delete('/:code/archer/:archerName', async (req: Request, res: Response) => {
    try {
      const { code, archerName } = req.params

      const result = await shootService.leaveShoot(code, archerName)

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: 'Shoot not found or archer not found'
        })
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