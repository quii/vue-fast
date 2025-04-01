class HistoryPage {
  navigateTo() {
    cy.get("a").contains("History").click();

    // Try multiple times to dismiss modal if it exists
    const maxAttempts = 10;
    const attemptDismissModal = (attempt = 0) => {
      cy.get("body").then($body => {
        if ($body.find("button:contains(\"Got it!\")").length > 0) {
          cy.contains("button", "Got it!").click();
        } else if (attempt < maxAttempts) {
          cy.wait(100);
          attemptDismissModal(attempt + 1);
        }
      });
    };
    attemptDismissModal();
  }

  selectHistoryItem(item) {
    // Update to work with card layout - look for the item text in the card
    cy.dismissToasters();
    cy.get(".history-card").contains(item).click();
  }

  checkTotalGolds(expectedGolds) {
    cy.get("[data-test=\"totalGolds\"]").contains(expectedGolds);
  }

  checkRecordExists(score) {
    // Update to work with card layout - look for the score in a highlighted card-score element
    cy.dismissToasters();
    cy.get(".card-score.highlight").contains(score);
  }

  checkScoreExists(score, round) {
    // Instead of using within(), check that there exists at least one card
    // that contains both the score and round
    cy.dismissToasters();
    cy.get(".history-card").then($cards => {
      const matchingCards = $cards.filter((_, card) => {
        const $card = Cypress.$(card);
        const hasRound = $card.find(".round-name").text().includes(round);
        const hasScore = $card.find(".card-score").text().includes(score);
        return hasRound && hasScore;
      });
      expect(matchingCards.length).to.be.at.least(1);
    });
  }

  checkNoteExists(noteText) {
    cy.get("[data-test=\"note-text\"]").contains(noteText);
  }

  checkNoteIsHighlighted(noteText) {
    // Check for a note row with both the highlighted class and the specified text
    cy.get("[data-test=\"note-row\"].highlighted").contains(noteText);
  }

  checkClassificationExists(score, classification) {
    cy.dismissToasters();
    // Instead of using within(), check that there exists at least one card
    // that contains both the score and classification
    cy.get(".history-card").then($cards => {
      const matchingCards = $cards.filter((_, card) => {
        const $card = Cypress.$(card);
        const hasScore = $card.find(".card-score").text().includes(score);
        const hasClassification = $card.find(".classification-name").text().includes(classification);
        return hasScore && hasClassification;
      });
      expect(matchingCards.length).to.be.at.least(1);
    });
  }
}

export default HistoryPage;