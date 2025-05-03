import ScorePage from '../pages/scorePage'
import HistoryPage from '../pages/historyPage'
import { userDataPage } from '../pages/userDataPage'

describe('History Filters', () => {
  const scorePage = new ScorePage()
  const historyPage = new HistoryPage()

  beforeEach(() => {
    scorePage.visit()
    scorePage.clearData()

    // Set up user profile
    userDataPage.navigateTo()
    userDataPage.setArcherDetails('male', 'recurve', 'senior')
  })

  it('maintains filter state when navigating back from a shoot', () => {
    // First, create some scores for different rounds
    // Score a Bray I round (low score, won't be a PB)
    scorePage.navigateTo()
    scorePage.selectGame('Bray I')
    for (let i = 0; i < 5; i++) {
      scorePage.score([5, 5, 5, 5, 5, 5]) // 150 total
    }
    scorePage.save()

    // Score a Bray II round
    scorePage.navigateTo()
    scorePage.selectGame('Bray II')
    for (let i = 0; i < 5; i++) {
      scorePage.score([7, 7, 7, 7, 7, 7]) // 210 total
    }
    scorePage.save()

    // Score another Bray I round (higher score, will be a PB)
    scorePage.navigateTo()
    scorePage.selectGame('Bray I')
    for (let i = 0; i < 5; i++) {
      scorePage.score([9, 9, 9, 9, 9, 9]) // 270 total, should be PB
    }
    scorePage.save()

    // Navigate to history page
    historyPage.navigateTo()

    // Apply filter by round
    historyPage.filterByRound('Bray I')

    // Verify filter is active
    historyPage.checkFilterActive('Round')

    // Check that only Bray I rounds are shown (should be 2)
    cy.get('.history-card').should('have.length', 2)

    // Click on the first history item (should be the PB one)
    historyPage.selectHistoryItem('270')


    // Navigate back
    cy.go('back')

    // Verify filter is still active
    historyPage.checkFilterActive('Round')

    // Check that only Bray I rounds are still shown
    cy.get('.history-card').should('have.length', 2)

    // Reset filters
    historyPage.resetFilters()

    // Verify filter is no longer active
    historyPage.checkFilterNotActive('Round')

    // Check that all rounds are shown (should be 3)
    cy.get('.history-card').should('have.length', 3)
  })

  it('filters by personal best correctly', () => {
    // Create scores with different PB status
    // Score a Bray I round (first score, will be a PB)
    scorePage.navigateTo()
    scorePage.selectGame('Bray I')
    for (let i = 0; i < 5; i++) {
      scorePage.score([7, 7, 7, 7, 7, 7]) // 210 total
    }
    scorePage.save()

    // Score another Bray I round (higher score, new PB)
    scorePage.navigateTo()
    scorePage.selectGame('Bray I')
    for (let i = 0; i < 5; i++) {
      scorePage.score([9, 9, 9, 9, 9, 9]) // 270 total, should be PB
    }
    scorePage.save()

    // Score another Bray I round (lower score, not a PB)
    scorePage.navigateTo()
    scorePage.selectGame('Bray I')
    for (let i = 0; i < 5; i++) {
      scorePage.score([6, 6, 6, 6, 6, 6]) // 180 total, not a PB
    }
    scorePage.save()

    // Navigate to history page
    historyPage.navigateTo()

    // Apply PB filter
    historyPage.togglePBFilter()

    // Verify filter is active
    historyPage.checkFilterActive('PB')

    // Check that only PB rounds are shown (should be 1)
    cy.get('.history-card').should('have.length', 1)
    cy.get('.history-card').should('contain', '270')

    // Click on the PB item
    historyPage.selectHistoryItem('270')

    // Navigate back
    cy.go('back')

    // Verify filter is still active
    historyPage.checkFilterActive('PB')

    // Check that only PB rounds are still shown
    cy.get('.history-card').should('have.length', 1)
    cy.get('.history-card').should('contain', '270')

    // Reset filters
    historyPage.resetFilters()

    // Check that all rounds are shown (should be 3)
    cy.get('.history-card').should('have.length', 3)
  })

  it('filters by classification correctly', () => {
    // Create scores with different classifications
    // Score a Bray I round with low score (likely A3 class)
    scorePage.navigateTo()
    scorePage.selectGame('Bray I')
    for (let i = 0; i < 5; i++) {
      scorePage.score([3, 3, 3, 3, 3, 3]) // 90 total
    }
    scorePage.save()

    // Score a Bray I round with medium score (likely B class)
    scorePage.navigateTo()
    scorePage.selectGame('Bray I')
    for (let i = 0; i < 5; i++) {
      scorePage.score([6, 6, 6, 6, 6, 6]) // 180 total
    }
    scorePage.save()

    // Score a Bray I round with high score (likely A class)
    scorePage.navigateTo()
    scorePage.selectGame('Bray I')
    for (let i = 0; i < 5; i++) {
      scorePage.score([9, 9, 9, 9, 9, 9]) // 270 total
    }
    scorePage.save()

    // Navigate to history page
    historyPage.navigateTo()

    // Apply classification filter (B class)
    historyPage.filterByClassification('B1')

    // Verify filter is active
    historyPage.checkFilterActive('Class')

    // Click on a history item
    historyPage.selectHistoryItem('270')

    // Navigate back
    cy.go('back')

    // Verify filter is still active
    historyPage.checkFilterActive('Class')

    // Reset filters
    historyPage.resetFilters()

    // Check that all rounds are shown (should be 3)
    cy.get('.history-card').should('have.length', 3)
  })

  it('combines multiple filters correctly', () => {
    // Create various scores
    // Bray I with low score
    scorePage.navigateTo()
    scorePage.selectGame('Bray I')
    for (let i = 0; i < 5; i++) {
      scorePage.score([4, 4, 4, 4, 4, 4]) // 120 total
    }
    scorePage.save()

    // Bray II with medium score
    scorePage.navigateTo()
    scorePage.selectGame('Bray II')
    for (let i = 0; i < 5; i++) {
      scorePage.score([6, 6, 6, 6, 6, 6]) // 180 total
    }
    scorePage.save()

    // Bray I with high score (PB)
    scorePage.navigateTo()
    scorePage.selectGame('Bray I')
    for (let i = 0; i < 5; i++) {
      scorePage.score([9, 9, 9, 9, 9, 9]) // 270 total, PB
    }
    scorePage.save()

    // Navigate to history page
    historyPage.navigateTo()

    // Apply round filter
    historyPage.filterByRound('Bray I')

    // Verify filter is active
    historyPage.checkFilterActive('Round')

    // Check that only Bray I rounds are shown (should be 2)
    cy.get('.history-card').should('have.length', 2)

    // Apply PB filter as well
    historyPage.togglePBFilter()

    // Verify both filters are active
    historyPage.checkFilterActive('Round')
    historyPage.checkFilterActive('PB')

    // Check that only Bray I PB rounds are shown (should be 1)
    cy.get('.history-card').should('have.length', 1)
    cy.get('.history-card').should('contain', '270')

    // Click on the history item
    historyPage.selectHistoryItem('270')

    // Navigate back
    cy.go('back')

    // Verify both filters are still active
    historyPage.checkFilterActive('Round')
    historyPage.checkFilterActive('PB')

    // Check that only Bray I PB rounds are still shown
    cy.get('.history-card').should('have.length', 1)

    // Reset filters
    historyPage.resetFilters()

    // Check that all rounds are shown (should be 3)
    cy.get('.history-card').should('have.length', 3)
  })
})