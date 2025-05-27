class ScorePage {
  visit() {
    cy.visit("/");
  }

  navigateTo() {
    cy.get("a").contains("Score").click();
  }

  clearData() {
    cy.get("body").then(($body) => {
      if ($body.find("#clear").length > 0) {
        cy.get("#clear").click();
      }
    });
  }

  tapRoundSelector() {
    cy.get(".round-card-wrapper").click();
    cy.wait(250)
    cy.get('body').then(($body) => {
      if ($body.find('.profile-setup-section').length > 0) {
        cy.contains('label', 'Age Group').parent().find('select').select('Senior')
        cy.contains('label', 'Gender').parent().find('select').select('Male')
        cy.contains('label', 'Bow Type').parent().find('select').select('Recurve')
      }

      if ($body.find('button:contains(\'Got it!\')').length > 0) {
        cy.contains('Got it!').click()
      }
    })


    cy.get('body').then(($body) => {
      if ($body.find('button:contains(\'Got it!\')').length > 0) {
        cy.contains('Got it!').click()
      }
    })
  }

  setMaxDistance(yards) {
    cy.get("#max-distance").invoke("val", yards).trigger("input");
  }

  checkRoundRecommendation(roundName, shouldExist = true) {
    if (shouldExist) {
      cy.contains(roundName).should("exist");
    } else {
      cy.contains(roundName).should("not.exist");
    }
  }

  // Private helper method to handle common round selection logic
  _selectRound(roundName, filterType = null) {
    this.tapRoundSelector();

    // Check if the Round Selection Tip Modal is visible and dismiss it
    cy.get('body').then(($body) => {
      if ($body.find('button:contains(\'Got it!\')').length > 0) {
        cy.contains('Got it!').click()
      }
    });

    cy.wait(250)

    cy.get('body').then(($body) => {
      if ($body.find('.profile-setup-section').length > 0) {
        cy.log('Profile setup form detected, filling out details')

          cy.contains('Age Group').parents('.form-group').find('select').select('senior', { force: true })
          cy.contains('Gender').parents('.form-group').find('select').select('male', { force: true })
          cy.contains('Bow Type').parents('.form-group').find('select').select('recurve', { force: true })
      }
    })

    cy.get('body').then(($body) => {
      if ($body.find('button:contains(\'Got it!\')').length > 0) {
        cy.contains('Got it!').click()
      }
    })

    // Apply filter if specified
    if (filterType) {
      cy.get('.filter-label').contains(filterType).click({ force: true })
    }

    // Try to find the search input, but don't fail if it doesn't exist
    cy.get("body").then($body => {
      // If search container exists, use it
      if ($body.find(".search-container input").length > 0) {
        cy.get(".search-container input").clear().type(roundName);
      }
    });

    // Find the round card with the exact matching round name
    cy.get('.rounds-container').should('exist').then(() => {
      cy.get('.rounds-container .round-name').each(($el) => {
        const text = $el.text().trim().toLowerCase()
        const searchName = roundName.toLowerCase()

        // Check for exact match or match with formatting differences
        if (text === searchName ||
          text === searchName.charAt(0).toUpperCase() + searchName.slice(1) ||
          // Handle special case for rounds with roman numerals
          text.replace(/\s+/g, ' ') === searchName.replace(/\s+/g, ' ')) {

          // Scroll the element into view and force click
          cy.wrap($el).scrollIntoView()
          cy.wrap($el).click({ force: true })

          return false // Break the each loop
        }
      });
    });
  }


  selectPractice(distance) {
    const gameName = `Practice ${distance}`;
    this._selectRound(gameName, "Practice");
  }

  selectGame(gameName) {
    this._selectRound(gameName);
  }

  score(input) {
    cy.dismissToasters();
    if (Array.isArray(input)) {
      input.forEach(score => {
        this.score(score);
      });
    } else {
      cy.get('.score-buttons button').contains(new RegExp('^' + input.toString() + '$', 'g')).click({ force: true })
    }
    return this;
  }

  times(n) {
    return {
      score: (number) => {
        for (let i = 0; i < n; i++) {
          this.score(number);
        }
        return this;
      }
    };
  }

  checkButtonState(number, state) {
    cy.get("button").contains(number.toString()).should(state);
  }

  checkTotalHits(expectedHits) {
    cy.get("[data-test=\"totalHits\"]").contains(expectedHits);
  }

  checkTotalScore(expectedScore) {
    cy.get("[data-test=\"totalScore\"]").contains(expectedScore);
  }

  checkSubTotalScore(expectedScore) {
    cy.get("[data-test=\"subTotalScore\"]").contains(expectedScore);
  }

  checkTotalGolds(expectedGolds) {
    cy.get("[data-test=\"totalGolds\"]").contains(expectedGolds);
  }

  checkSubTotalGolds(expectedGolds) {
    cy.get("[data-test=\"subTotalGolds\"]").contains(expectedGolds);
  }

  save() {
    cy.get(".save-button").click();
  }

  saveToHistory() {
    cy.contains('Save to history').click()
  }

  assertButtonIsDisabled(buttonValue) {
    this.checkButtonState(buttonValue, "be.disabled");
  }

  assertButtonIsEnabled(buttonValue) {
    this.checkButtonState(buttonValue, "be.enabled");
  }

  addNote(noteText) {
    // Click the Note button in the TopBar to open the note modal
    cy.get('span').contains('Note').click({ force: true })

    // Wait for the modal to be visible
    cy.get('.note-textarea').should('be.visible')

    // Clear the textarea first to ensure it's empty
    cy.get('.note-textarea').clear()

    // Type the note text with a delay to ensure it's properly entered
    cy.get('.note-textarea').type(noteText, { delay: 10 })

    // Verify the text was entered correctly
    cy.get('.note-textarea').should('have.value', noteText)

    cy.wait(500) // Add a small wait to ensure the note is rendered
    // Click the Save Note button
    // cy.contains(" Save Note ").click({ force: true });
    cy.get('[data-test="save-note-button"]').click({ force: true })

    // Take a screenshot after saving
    cy.screenshot('after-saving-note')

    // Wait for the note to be added to the DOM
    cy.wait(500) // Add a small wait to ensure the note is rendered
  }

  highlightNote(noteText) {
    cy.log(`Attempting to highlight note: ${noteText}`)

    // Take a screenshot before highlighting
    cy.screenshot('before-highlighting-note')

    // Check if the note element exists
    cy.get('body').then($body => {
      if ($body.find('[data-test="note-text"]').length > 0) {
        cy.log('Note element found')
      } else {
        cy.log('Note element not found, will retry')
      }
    });

    // Wait for the note element to be available with a longer timeout
    cy.get('[data-test="note-text"]', { timeout: 20000 })
      .should('exist')
      .contains(noteText, { timeout: 20000 })
      .should('exist')
      .click({ force: true });

    // Take a screenshot after highlighting
    cy.screenshot('after-highlighting-note')
  }

  clickClassificationDetails() {
    cy.get(`[aria-label="Class"]`).click()
  }

  checkClassificationTable(expectedClassification, shortBy) {
    // Then check for the classification and shortBy value
    cy.get(".classification-table-container").within(() => {
      // Find the row containing the classification
      cy.contains(".classification-badge", expectedClassification)
        .closest(".table-row")
        .within(() => {
          if (shortBy) {
            // Look for the shortBy value in the score cell
            cy.get(".score-cell").contains(shortBy);
          }
        });
    });
  }


  checkClassificationAchieved(classification) {
    // Check for the classification badge and then verify the achieved class
    cy.get(".classification-table-container")
      .contains(".classification-badge", classification)
      .closest(".table-row")
      .should("have.class", "achieved");
  }

  checkClassificationMissed(classification) {
    // Check for the classification badge and then verify it doesn't have the achieved class
    cy.get(".classification-table-container")
      .contains(".classification-badge", classification)
      .closest(".table-row")
      .should("not.have.class", "achieved");
  }
}

export default ScorePage;
