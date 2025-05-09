import { describe, it, expect, beforeEach } from 'vitest'
import { setupApp, setupTestEnvironment } from './testHarness'
import { ScorePage } from './pages/scorePage'
import { HistoryPage } from './pages/historyPage'
import './customMatchers'

setupTestEnvironment()

describe('Practicing', () => {
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

  it('can pick a practice and score', async () => {
    await scorePage.selectGame('Practice 60yd')

    await scorePage.score(7)

    // Check button states
    const button7 = await scorePage.button('7')
    const button9 = await scorePage.button('9')

    expect(button7).toBeEnabled()
    expect(button9).toBeDisabled()
  })

  it('can save practice scores at any point without reaching max arrows', async () => {
    await scorePage.selectGame('Practice 50m')

    // Score just 2 arrows
    await scorePage.score(9)
    await scorePage.score(7)

    // Calculate expected total score
    const expectedScore = '16'

    // Verify the current score before saving
    const subTotalScore = await scorePage.getSubTotalScore()
    expect(subTotalScore).toContain(expectedScore)

    // Save to history
    await scorePage.saveToHistory()
    await scorePage.save()

    // Navigate to history page
    await historyPage.visit()

    // Check that the score exists in history
    await historyPage.checkScoreExists(expectedScore, 'Practice 50m')
  })
})