import { describe, it, expect, beforeEach } from 'vitest'
import { setupApp, setupTestEnvironment } from './testHarness'
import { ScorePage } from './pages/scorePage'
import './customMatchers'

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

  it('works with wonky 2.5 round length games like Bray I', async () => {
    await scorePage.selectGame('Bray I')

    await scorePage.times(30).score(10)

    expect(await scorePage.button('10')).toBeDisabled()
  })

  it('understands worcester rules', async () => {
    await scorePage.selectGame('Worcester')

    await scorePage.score('5')

    expect(await scorePage.button('5')).toBeEnabled()

    await scorePage.score('4')

    expect(await scorePage.button('5')).toBeDisabled()

    expect(await scorePage.getSubTotalScore()).toContain('9')
  })

  it('understands vegas 300 rules, which are 10 to 6', async () => {
    await scorePage.selectGame('Vegas 300')

    await scorePage.score('X')

    expect(await scorePage.button('X')).toBeEnabled()

    await scorePage.score('10')

    expect(await scorePage.button('X')).toBeDisabled()

    await scorePage.score('6')

    expect(await scorePage.getSubTotalScore()).toContain('26')
  })
})
