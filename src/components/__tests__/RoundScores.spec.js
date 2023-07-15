import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import RoundScores from '@/components/RoundScores.vue'

describe('RoundScores', () => {
  it('renders totals', () => {
    const wrapper = mount(RoundScores, { props: { scores: [9, 9, 9], gameType: 'national' } })

    const totalHits = wrapper.get('[data-test="totalHits"]')
    expect(totalHits.text()).toBe('3')

    const totalScore = wrapper.get('[data-test="totalScore"]')
    expect(totalScore.text()).toBe('27')

    const totalGolds = wrapper.get('[data-test="totalGolds"]')
    expect(totalGolds.text()).toBe('3')
  })
})
