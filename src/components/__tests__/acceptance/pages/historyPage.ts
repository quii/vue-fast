import { VueWrapper } from '@vue/test-utils'
import { BasePage } from './basePage'

export class HistoryPage extends BasePage {
  constructor(wrapper: VueWrapper) {
    super(wrapper)
  }

  // Navigate to the history page
  async visit() {
    await this.findByText('History', 'a').then(el => el.trigger('click'))
  }

  // Check if a score exists for a specific round
  async checkScoreExists(score: string, round: string): Promise<void> {
    // Find all history cards
    const cards = await this.wrapper.findAll('.history-card')

    // Check if any card contains both the score and round name
    let found = false
    for (const card of cards) {
      const cardText = card.text()
      if (cardText.includes(score) && cardText.includes(round)) {
        found = true
        break
      }
    }

    if (!found) {
      throw new Error(`Could not find history card with score ${score} and round ${round}`)
    }
  }
}