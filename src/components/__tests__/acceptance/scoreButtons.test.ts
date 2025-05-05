import { describe, it, expect, beforeEach } from 'vitest'
import { setupApp, setupTestEnvironment } from './testHarness'
import { ScorePage } from './pages/scorePage'
import './customMatchers' // Import custom matchers

setupTestEnvironment()

describe('Score Buttons', () => {
  let wrapper: any
  let scorePage: ScorePage

  beforeEach(async () => {
    const result = await setupApp()
    wrapper = result.wrapper
    scorePage = new ScorePage(wrapper)

    await scorePage.visit()
    await scorePage.clearData()
  })

  it('when a 7 is scored in an end for imperial, you cannot enter a 9', async () => {
    await scorePage.selectGame('Windsor')

    await scorePage.score(7)

    expect(await scorePage.button('9')).toBeDisabled()
    expect(await scorePage.button('7')).toBeEnabled()
  })

  it('when the end is over, all buttons should be re-enabled', async () => {
    await scorePage.selectGame('Windsor')

    await scorePage.score(7)
    expect(await scorePage.button('9')).toBeDisabled()

    await scorePage.times(5).score(7)
    expect(await scorePage.button('9')).toBeEnabled()
  })

  it('when a 10 is scored with a metric, you can no longer score an X', async () => {
    await scorePage.selectGame('Metric III')

    await scorePage.score(10)

    expect(await scorePage.button('X')).toBeDisabled()
  })
})
