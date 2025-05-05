import { VueWrapper } from '@vue/test-utils'
import { BasePage } from './basePage'

export class ScorePage extends BasePage {
  constructor(wrapper: VueWrapper) {
    super(wrapper)
  }

  // Visit the score page
  async visit() {
    await this.navigateTo('/')
  }

  // Clear any existing data
  async clearData() {
    const clearButton = await this.wrapper.find('#clear')
    if (clearButton.exists()) {
      await clearButton.trigger('click')
      await this.waitForUpdate()
    }
  }

  // Select a round/game
  async selectGame(gameName: string) {
    // Find and click the round selector
    const roundSelector = await this.wrapper.find('.round-card-wrapper')
    if (!roundSelector.exists()) {
      console.error('Round selector not found. Current HTML:', this.wrapper.html())
      console.log('Current URL', this.getCurrentPath())
      throw new Error('Round selector element (.round-card-wrapper) not found in the DOM')
    }

    await roundSelector.trigger('click')
    await this.waitForUpdate()

    // Search for the round if search input exists
    const searchInput = await this.wrapper.find('.search-container input')
    if (searchInput.exists()) {
      await searchInput.setValue(gameName)
      await this.waitForUpdate()
    }

    // Find and click the round with the matching name
    const roundElements = await this.wrapper.findAll('.rounds-container .round-name')
    for (const element of roundElements) {
      if (element.text().trim().toLowerCase() === gameName.toLowerCase()) {
        await element.trigger('click')
        await this.waitForUpdate()
        break
      }
    }
  }

  // Score an arrow
  async score(value: number | string) {
    const button = await this.button(value.toString())
    await button.click()
    await this.waitForUpdate()
    return this
  }

  // Score multiple arrows of the same value
  times(n: number) {
    return {
      score: async (value: number | string) => {
        for (let i = 0; i < n; i++) {
          await this.score(value)
        }
        return this
      }
    }
  }

  // Get total hits
  async getTotalHits(): Promise<string> {
    const totalHitsElement = await this.wrapper.find('[data-test="totalHits"]')
    return totalHitsElement.text()
  }

  // Get total score
  async getTotalScore(): Promise<string> {
    const totalScoreElement = await this.wrapper.find('[data-test="totalScore"]')
    return totalScoreElement.text()
  }

  // Get subtotal score
  async getSubTotalScore(): Promise<string> {
    const subTotalScoreElement = await this.wrapper.find('[data-test="subTotalScore"]')
    return subTotalScoreElement.text()
  }

  // Get total golds
  async getTotalGolds(): Promise<string> {
    const totalGoldsElement = await this.wrapper.find('[data-test="totalGolds"]')
    return totalGoldsElement.text()
  }

  // Get subtotal golds
  async getSubTotalGolds(): Promise<string> {
    const subTotalGoldsElement = await this.wrapper.find('[data-test="subTotalGolds"]')
    return subTotalGoldsElement.text()
  }

  // Save the score
  async save() {
    const saveButton = await this.wrapper.find('.save-button')
    await saveButton.trigger('click')
    await this.waitForUpdate()
  }

  // Save to history
  async saveToHistory() {
    const saveToHistoryButton = await this.findByText('Save to history', 'button')
    await saveToHistoryButton.trigger('click')
    await this.waitForUpdate()
  }

  // Add a note
  async addNote(noteText: string) {
    // Click the Note button in the TopBar
    const noteButton = await this.findByText('Note', 'span')
    await noteButton.trigger('click')
    await this.waitForUpdate()

    // Find the note textarea and enter text
    const noteTextarea = await this.wrapper.find('.note-textarea')
    await noteTextarea.setValue(noteText)
    await this.waitForUpdate()

    // Click the Save Note button
    const saveNoteButton = await this.wrapper.find('[data-test="save-note-button"]')
    await saveNoteButton.trigger('click')
    await this.waitForUpdate()
  }

  // Highlight a note
  async highlightNote(noteText: string) {
    const noteElement = await this.findByText(noteText, '[data-test="note-text"]')
    await noteElement.trigger('click')
    await this.waitForUpdate()
  }

  // Click classification details
  async clickClassificationDetails() {
    const classButton = await this.findByText('Class', 'span')
    await classButton.trigger('click')
    await this.waitForUpdate()
  }

  // Check if a classification exists in the table
  async hasClassification(classification: string): Promise<boolean> {
    const classificationBadge = await this.findByText(classification, '.classification-table-container .classification-badge')
    return classificationBadge.exists()
  }

  // Get the "short by" value for a classification
  async getClassificationShortBy(classification: string): Promise<string | null> {
    const classificationBadge = await this.findByText(classification, '.classification-table-container .classification-badge')
    if (!classificationBadge.exists()) {
      return null
    }

    const row = classificationBadge.closest('.table-row')
    const scoreCell = await row.find('.score-cell')
    return scoreCell.text()
  }

  // Check if a classification is achieved
  async isClassificationAchieved(classification: string): Promise<boolean> {
    const classificationBadge = await this.findByText(classification, '.classification-table-container .classification-badge')
    if (!classificationBadge.exists()) {
      return false
    }

    const row = classificationBadge.closest('.table-row')
    return row.classes().includes('achieved')
  }

  // Add this method to the ScorePage class
  async saveInModal() {
    // Find the save button in the ShootEditModal
    const saveButton = await this.wrapper.find('.modal-content .save-button')
    if (!saveButton.exists()) {
      throw new Error('Save button in modal not found')
    }

    await saveButton.trigger('click')
    await this.waitForUpdate()

    // Wait a bit longer for the navigation to complete
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}
