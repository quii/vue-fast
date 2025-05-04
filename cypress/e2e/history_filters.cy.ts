import ScorePage from '../pages/scorePage'
import HistoryPage from '../pages/historyPage'
import { userDataPage } from '../pages/userDataPage'

describe('History Filters', () => {
  const scorePage = new ScorePage()
  const historyPage = new HistoryPage()

  it('verifies all history filter functionality', () => {
    cy.disableAllTips()
    scorePage.visit()
    cy.disableAllTips()
    scorePage.clearData()

    // Set up user profile
    userDataPage.navigateTo()
    userDataPage.setArcherDetails('male', 'recurve', 'senior')

    // Create all the scores we'll need for testing
    // Score a Bray I round (low score, won't be a PB)
    scorePage.navigateTo()
    scorePage.selectGame('Bray I')
    for (let i = 0; i < 5; i++) {
      scorePage.score([3, 3, 3, 3, 3, 3]) // 90 total (likely A3 class)
    }
    scorePage.save()

    // Score a Bray II round
    scorePage.navigateTo()
    scorePage.selectGame('Bray II')
    for (let i = 0; i < 5; i++) {
      scorePage.score([6, 6, 6, 6, 6, 6]) // 180 total
    }
    scorePage.save()

    // Score a Bray I round with medium score (likely B class)
    scorePage.navigateTo()
    scorePage.selectGame('Bray I')
    for (let i = 0; i < 5; i++) {
      scorePage.score([6, 6, 6, 6, 6, 6]) // 180 total
    }
    scorePage.save()

    // Score a Bray I round with high score (PB, likely A class)
    scorePage.navigateTo()
    scorePage.selectGame('Bray I')
    for (let i = 0; i < 5; i++) {
      scorePage.score([9, 9, 9, 9, 9, 9]) // 270 total, should be PB
    }
    scorePage.save()

    // Navigate to history page
    historyPage.navigateTo()

    // TEST 1: Filter by round
    cy.log('Testing round filter')
    historyPage.filterByRound('Bray I')
    historyPage.checkFilterActive('Round')
    cy.get('.history-card').should('have.length', 3) // 3 Bray I rounds

    // Click on a history item and navigate back
    historyPage.selectHistoryItem('270')
    cy.go('back')

    // Verify filter is still active
    historyPage.checkFilterActive('Round')
    cy.get('.history-card').should('have.length', 3)

    // Reset filters
    historyPage.resetFilters()
    historyPage.checkFilterNotActive('Round')
    cy.get('.history-card').should('have.length', 4) // All 4 rounds

    // TEST 2: Filter by personal best
    cy.log('Testing PB filter')
    historyPage.togglePBFilter()
    historyPage.checkFilterActive('PB')
    cy.get('.history-card').should('have.length', 2) // Only 1 PB
    cy.get('.history-card').should('contain', '270')

    // Click on the PB item and navigate back
    historyPage.selectHistoryItem('270')
    cy.go('back')

    // Verify filter is still active
    historyPage.checkFilterActive('PB')
    cy.get('.history-card').should('have.length', 2)

    // Reset filters
    historyPage.resetFilters()
    cy.get('.history-card').should('have.length', 4) // All 4 rounds

    // TEST 3: Filter by classification
    cy.log('Testing classification filter')
    historyPage.filterByClassification('B1')
    historyPage.checkFilterActive('Class')

    // Click on a history item and navigate back
    historyPage.selectHistoryItem('270')
    cy.go('back')

    // Verify filter is still active
    historyPage.checkFilterActive('Class')

    // Reset filters
    historyPage.resetFilters()
    cy.get('.history-card').should('have.length', 4) // All 4 rounds

    // TEST 4: Combine multiple filters
    cy.log('Testing combined filters')
    historyPage.filterByRound('Bray I')
    historyPage.checkFilterActive('Round')
    cy.get('.history-card').should('have.length', 3) // 3 Bray I rounds

    // Apply PB filter as well
    historyPage.togglePBFilter()
    historyPage.checkFilterActive('Round')
    historyPage.checkFilterActive('PB')
    cy.get('.history-card').should('have.length', 1) // Only 1 Bray I PB
    cy.get('.history-card').should('contain', '270')

    // Click on the history item and navigate back
    historyPage.selectHistoryItem('270')
    cy.go('back')

    // Verify both filters are still active
    historyPage.checkFilterActive('Round')
    historyPage.checkFilterActive('PB')
    cy.get('.history-card').should('have.length', 1)

    // Reset filters
    historyPage.resetFilters()
    cy.get('.history-card').should('have.length', 4) // All 4 rounds
  })
})