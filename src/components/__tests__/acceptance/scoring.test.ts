import { describe, it, expect, beforeEach } from 'vitest'
import { setupApp, setupTestEnvironment } from './testHarness'
import { ScorePage } from './pages/scorePage'
import { HistoryPage } from './pages/historyPage'
import './customMatchers'
import { ruthsFrostbiteGame, ruthsGame } from '@/domain/scoring/test_data'

setupTestEnvironment()

describe(`Scoring tests using Ruth's game`, () => {
  let wrapper: any
  let scorePage: ScorePage
  let historyPage: HistoryPage

  beforeEach(async () => {
    const result = await setupApp()
    wrapper = result.wrapper
    scorePage = new ScorePage(wrapper)
    historyPage = new HistoryPage(wrapper)

    await scorePage.visit()
    await scorePage.clearData()
  })

  it('records all the scores and calculates the totals for an imperial game', async () => {
    await scorePage.selectGame('Windsor')

    // Score all arrows from Ruth's game
    for (const score of ruthsGame) {
      await scorePage.score(score)
    }

    // Check totals
    const totalHits = await scorePage.getTotalHits()
    const totalScore = await scorePage.getTotalScore()
    const totalGolds = await scorePage.getTotalGolds()

    expect(totalHits).toContain('108')
    expect(totalScore).toContain('804')
    expect(totalGolds).toContain('56')
  })

  it('also works for a frostbite game', async () => {
    await scorePage.selectGame('Frostbite')

    // Score all arrows from Ruth's frostbite game
    for (const score of ruthsFrostbiteGame) {
      await scorePage.score(score)
    }

    // Check subtotals
    const subTotalScore = await scorePage.getSubTotalScore()
    const subTotalGolds = await scorePage.getSubTotalGolds()

    expect(subTotalScore).toContain('254')
    expect(subTotalGolds).toContain('4')
  })

  it('should record the actual score in the history, not 0', async () => {
    // Create a simplified test data set similar to ruthsFrostbiteGame but for WA 70m
    const zeroBugScores = [
      9,
      1,
      1,
      1,
      "M",
      "M",
      8,
      6,
      5,
      5,
      5,
      3,
      7,
      6,
      5,
      5,
      4,
      3,
      8,
      5,
      5,
      2,
      1,
      "M",
      8,
      7,
      7,
      6,
      2,
      2,
      9,
      8,
      8,
      6,
      5,
      4,
      8,
      8,
      6,
      3,
      "M",
      "M",
      7,
      5,
      5,
      4,
      4,
      "M",
      6,
      5,
      1,
      1,
      "M",
      "M",
      "X",
      6,
      6,
      1,
      1,
      "M",
      10,
      6,
      5,
      5,
      4,
      4,
      6,
      5,
      4,
      4,
      "M",
      "M"
    ];


    await scorePage.selectGame('WA 70m')
    const currentGameType = await scorePage.getCurrentGameType()
    console.log(currentGameType)

    // Score all arrows
    for (const score of zeroBugScores) {
      await scorePage.score(score)
    }

    const subTotalScore = await scorePage.getSubTotalScore()
    expect(subTotalScore).toContain(307)

    // Save to history
    await scorePage.saveToHistory()
    await scorePage.save()

    // Navigate to history page and check the record exists
    await historyPage.visit()
    await historyPage.checkScoreExists(307, 'WA 70m')
  })
})
