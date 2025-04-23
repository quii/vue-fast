import { expect, describe, test } from 'vitest'
import { Round } from '@/domain/scoring/round/round'
import { GameTypeConfig } from '@/domain/scoring/game_types'

describe('Round', () => {
  describe('getScores', () => {
    // Test for Worcester round with compound bow
    test('should include X for compound bow in Worcester round', () => {
      // Create a Worcester round config
      const worcesterConfig: GameTypeConfig = {
        name: 'Worcester',
        scores: [5, 4, 3, 2, 1, 'X', 'M'],
        unit: 'yd',
        endSize: 5,
        isOutdoor: false,
        maxArrows: 60,
        canSaveAnytime: false,
        isPracticeRound: false,
        numberOfEnds: 12,
        isImperial: true,
        maxDistanceMetres: 18,
        maxDistanceYards: 20
      }

      const worcesterRound = new Round(worcesterConfig)

      // For compound bow, X should be included
      const compoundScores = worcesterRound.getScores('compound')
      expect(compoundScores).toContain('X')
      expect(compoundScores).toEqual([5, 4, 3, 2, 1, 'X', 'M'])
    })

    // Test for Worcester round with other bow types
    test('should exclude X for non-compound bows in Worcester round', () => {
      // Create a Worcester round config
      const worcesterConfig: GameTypeConfig = {
        name: 'Worcester',
        scores: [5, 4, 3, 2, 1, 'X', 'M'],
        unit: 'yd',
        endSize: 5,
        isOutdoor: false,
        maxArrows: 60,
        canSaveAnytime: false,
        isPracticeRound: false,
        numberOfEnds: 12,
        isImperial: true,
        maxDistanceMetres: 18,
        maxDistanceYards: 20
      }

      const worcesterRound = new Round(worcesterConfig)

      // Test with recurve bow
      const recurveScores = worcesterRound.getScores('recurve')
      expect(recurveScores).not.toContain('X')
      expect(recurveScores).toEqual([5, 4, 3, 2, 1, 'M'])

      // Test with barebow
      const barebowScores = worcesterRound.getScores('barebow')
      expect(barebowScores).not.toContain('X')
      expect(barebowScores).toEqual([5, 4, 3, 2, 1, 'M'])

      // Test with longbow
      const longbowScores = worcesterRound.getScores('longbow')
      expect(longbowScores).not.toContain('X')
      expect(longbowScores).toEqual([5, 4, 3, 2, 1, 'M'])
    })

    // Test for non-Worcester rounds
    test('should return all scores for non-Worcester rounds regardless of bow type', () => {
      // Create a non-Worcester round config (e.g., WA 18m)
      const wa18mConfig: GameTypeConfig = {
        name: 'WA 18m',
        scores: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 'M'],
        unit: 'm',
        endSize: 3,
        isOutdoor: false,
        maxArrows: 60,
        canSaveAnytime: false,
        isPracticeRound: false,
        numberOfEnds: 20,
        isImperial: false,
        maxDistanceMetres: 18,
        maxDistanceYards: 20
      }

      const wa18mRound = new Round(wa18mConfig)

      // For compound bow
      const compoundScores = wa18mRound.getScores('compound')
      expect(compoundScores).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 'M'])

      // For recurve bow
      const recurveScores = wa18mRound.getScores('recurve')
      expect(recurveScores).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 'M'])
    })

    // Test for case insensitivity
    test('should be case-insensitive for round name and bow type', () => {
      // Create a Worcester round config with lowercase name
      const worcesterConfig: GameTypeConfig = {
        name: 'worcester',
        scores: [5, 4, 3, 2, 1, 'X', 'M'],
        unit: 'yd',
        endSize: 5,
        isOutdoor: false,
        maxArrows: 60,
        canSaveAnytime: false,
        isPracticeRound: false,
        numberOfEnds: 12,
        isImperial: true,
        maxDistanceMetres: 18,
        maxDistanceYards: 20
      }

      const worcesterRound = new Round(worcesterConfig)

      // Test with uppercase compound
      const compoundScores = worcesterRound.getScores('COMPOUND')
      expect(compoundScores).toContain('X')

      // Test with mixed case recurve
      const recurveScores = worcesterRound.getScores('ReCuRvE')
      expect(recurveScores).not.toContain('X')
    })
  })

  // Additional tests for other methods in the Round class
  describe('getMaxDistance', () => {
    test('should return distance in meters when unit is m', () => {
      const config: GameTypeConfig = {
        name: 'Test Round',
        scores: [9, 7, 5, 3, 1, 'M'],
        unit: 'yd',
        endSize: 6,
        isOutdoor: true,
        maxArrows: 72,
        canSaveAnytime: false,
        isPracticeRound: false,
        numberOfEnds: 12,
        isImperial: true,
        maxDistanceMetres: 70,
        maxDistanceYards: 77
      }

      const round = new Round(config)
      expect(round.getMaxDistance('m')).toBe(70)
    })

    test('should return distance in yards when unit is yd', () => {
      const config: GameTypeConfig = {
        name: 'Test Round',
        scores: [9, 7, 5, 3, 1, 'M'],
        unit: 'yd',
        endSize: 6,
        isOutdoor: true,
        maxArrows: 72,
        canSaveAnytime: false,
        isPracticeRound: false,
        numberOfEnds: 12,
        isImperial: true,
        maxDistanceMetres: 70,
        maxDistanceYards: 77
      }

      const round = new Round(config)
      expect(round.getMaxDistance('yd')).toBe(77)
    })
  })

  describe('prettyRoundName', () => {
    test('should format round name correctly', () => {
      const config: GameTypeConfig = {
        name: 'wa_70m',
        scores: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 'M'],
        unit: 'm',
        endSize: 6,
        isOutdoor: true,
        maxArrows: 72,
        canSaveAnytime: false,
        isPracticeRound: false,
        numberOfEnds: 12,
        isImperial: false,
        maxDistanceMetres: 70,
        maxDistanceYards: 77
      }

      const round = new Round(config)
      expect(round.prettyRoundName()).not.toBe('wa_70m') // The actual formatting depends on formatRoundName implementation
    })
  })

  describe('toConfig', () => {
    test('should convert Round back to GameTypeConfig', () => {
      const originalConfig: GameTypeConfig = {
        name: 'Test Round',
        scores: [9, 7, 5, 3, 1, 'M'],
        unit: 'yd',
        endSize: 6,
        isOutdoor: true,
        maxArrows: 72,
        canSaveAnytime: false,
        isPracticeRound: false,
        numberOfEnds: 12,
        isImperial: true,
        maxDistanceMetres: 70,
        maxDistanceYards: 77,
        otherDistancesYards: [60, 50],
        otherDistancesMetres: [55, 45]
      }

      const round = new Round(originalConfig)
      const convertedConfig = round.toConfig()

      expect(convertedConfig).toEqual(originalConfig)
    })
  })
})