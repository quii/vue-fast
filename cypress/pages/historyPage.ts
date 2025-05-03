class HistoryPage {
  navigateTo() {
    cy.get('a').contains('History').click()
  }

  selectHistoryItem(item) {
    // Update to work with card layout - look for the item text in the card
    cy.dismissToasters()
    cy.get('.history-card').contains(item).click()
    cy.wait(500)
  }

  checkTotalGolds(expectedGolds) {
    cy.get('[data-test="totalGolds"]').contains(expectedGolds)
  }

  checkRecordExists(score) {
    // Update to work with card layout - look for the score in a highlighted card-score element
    cy.dismissToasters()
    cy.get('.card-score.highlight').contains(score)
  }

  checkScoreExists(score, round) {
    // Instead of using within(), check that there exists at least one card
    // that contains both the score and round
    cy.dismissToasters()
    cy.get('.history-card').then($cards => {
      const matchingCards = $cards.filter((_, card) => {
        const $card = Cypress.$(card)
        const hasRound = $card.find('.round-name').text().includes(round)
        const hasScore = $card.find('.card-score').text().includes(score)
        return hasRound && hasScore
      })
      expect(matchingCards.length).to.be.at.least(1)
    })
  }

  checkNoteExists(noteText) {
    cy.get('[data-test="note-text"]').contains(noteText)
  }

  checkNoteIsHighlighted(noteText) {
    // Check for a note row with both the highlighted class and the specified text
    cy.get('[data-test="note-row"].highlighted').contains(noteText)
  }

  checkClassificationExists(score, classification) {
    cy.dismissToasters()
    // Instead of using within(), check that there exists at least one card
    // that contains both the score and classification
    cy.get('.history-card').then($cards => {
      const matchingCards = $cards.filter((_, card) => {
        const $card = Cypress.$(card)
        const hasScore = $card.find('.card-score').text().includes(score)
        const hasClassification = $card.find('.classification-name').text().includes(classification)
        return hasScore && hasClassification
      })
      expect(matchingCards.length).to.be.at.least(1)
    })
  }

  // Method to toggle PB filter
  togglePBFilter() {
    cy.get('button').contains('PB').click()
    return this
  }

  // Method to filter by round
  filterByRound(roundName) {
    cy.get('button').contains('Round').click()

    if (roundName === '') {
      // If empty string is passed, select "All Rounds"
      cy.get('.round-buttons').within(() => {
        cy.get('.all-button').click()
      })
    } else {
      // Otherwise find the specific round by name
      cy.get('.round-buttons').within(() => {
        // Look for the button containing the round name
        cy.get('.round-name').contains(roundName).closest('button').click()
      })
    }

    return this
  }

  // Method to filter by classification
  filterByClassification(classification) {
    // Log the action for debugging
    cy.log(`Filtering by classification: ${classification}`)

    // Click the Class button with more specific targeting
    cy.contains('span.filter-label', 'Class').closest('button')
      .should('be.visible')
      .click({ force: true })

    // Wait for modal with a longer timeout
    cy.get('.modal-content', { timeout: 10000 }).should('be.visible').within(() => {
      if (classification === '') {
        // If empty string is passed, select "All Classifications"
        cy.contains('All Classifications').click({ force: true })
      } else {
        // Otherwise find the specific classification
        cy.contains(classification).should('be.visible').click({ force: true })
      }
    })

    return this
  }

  // Method to reset all filters
  resetFilters() {
    cy.get('button').contains('Reset').click()
    return this
  }

  // Method to check if a filter is active
  checkFilterActive(filterName) {
    cy.get('button').contains('.filter-label', filterName).closest('button').should('have.class', 'active')
    return this
  }

  // Method to check if a filter is not active
  checkFilterNotActive(filterName) {
    cy.get('button').contains('.filter-label', filterName).closest('button').should('not.have.class', 'active')
    return this
  }
}

export default HistoryPage