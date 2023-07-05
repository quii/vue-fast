import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import ScoreButtons from "@/components/ScoreButtons.vue";

describe('RoundScores', () => {
  it('renders buttons for each type of score, and emits an event when clicked', () => {
    const validScores = [9, 7, 'M'];
    const wrapper = mount(ScoreButtons, { props: { validScores: validScores } })

    wrapper.find('[data-test="score-9"]').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('score', [[9]])

    wrapper.find('[data-test="score-7"]').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('score', [[9], [7]])

    wrapper.find('[data-test="score-M"]').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('score', [[9], [7], ['M']])
  })
})