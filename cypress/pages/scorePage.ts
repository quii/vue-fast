class ScorePage {
  visit() {
    cy.visit("/");
    this.dismissTutorialIfVisible()
  }

  navigateTo() {
    cy.get("a").contains("Score").click();

    // Check if the tutorial is visible and click through it if it appears
    this.dismissTutorialIfVisible()
  }

  // Helper method to dismiss the tutorial if it's visible
  dismissTutorialIfVisible() {
    // First check if the tutorial overlay exists
    cy.get('body').then(($body) => {
      if ($body.find('.tutorial-overlay').length > 0) {
        cy.log('Tutorial detected, clicking through steps')

        // Try the Skip button first as a faster alternative
        if ($body.find('.skip-button').length > 0) {
          cy.log('Skip button found, using it to dismiss tutorial')
          cy.get('.skip-button').click({ force: true })

          // Verify the tutorial is gone
          cy.get('.tutorial-overlay').should('not.exist')
          return
        }

        // If Skip button approach didn't work, click through all steps
        let stepCount = 0
        const maxSteps = 10 // Safety limit to prevent infinite loops

        const clickNextUntilDone = () => {
          // Increment step counter
          stepCount++

          // Safety check to prevent infinite recursion
          if (stepCount > maxSteps) {
            cy.log('Maximum tutorial steps exceeded, forcing continue')
            // Try to force-click the Got it button as a last resort
            cy.get('.next-button').click({ force: true })
            return
          }

          // Check if tutorial is still visible
          cy.get('body').then(($updatedBody) => {
            if ($updatedBody.find('.tutorial-overlay').length > 0) {
              // Check if the last step button (Got it!) is visible
              if ($updatedBody.find('.next-button:contains("Got it!")').length > 0) {
                cy.log(`Tutorial step ${stepCount}: Clicking "Got it!" to finish`)
                cy.get('.next-button').contains('Got it!').click({ force: true })

                // Verify the tutorial is gone
                cy.get('.tutorial-overlay').should('not.exist')
              } else {
                // Click Next and continue
                cy.log(`Tutorial step ${stepCount}: Clicking "Next"`)
                cy.get('.next-button').contains('Next').click({ force: true })

                // Wait a moment for the transition to complete
                cy.wait(300)

                // Recursively check and click until done
                clickNextUntilDone()
              }
            } else {
              cy.log('Tutorial dismissed successfully')
            }
          });
        };

        clickNextUntilDone()
      } else {
        cy.log('No tutorial detected, continuing')
      }
    });
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
    cy.wait(500)
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

    // Check if the tutorial appears after tapping round selector and dismiss it
    this.dismissTutorialIfVisible()

    // Check if the Round Selection Tip Modal is visible and dismiss it
    cy.get('body').then(($body) => {
      if ($body.find('button:contains(\'Got it!\')').length > 0) {
        cy.contains('Got it!').click()
      }
    });

    cy.wait(500)

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

    // Wait for filtering to complete
    cy.wait(500)

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
      cy.get("button").contains(new RegExp("^" + input.toString() + "$", "g")).click();
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
    cy.get("span").contains("Note").click();

    // Now we need to target the BaseTextarea in the NoteModal
    cy.get(".note-textarea").type(noteText);

    // Click the Save Note button
    cy.get("button").contains("Save Note").click();
  }

  highlightNote(noteText) {
    // Use force: true to click even if the element is not visible
    cy.get("[data-test=\"note-text\"]").contains(noteText).click({ force: true });
  }

  clickClassificationDetails() {
    // Now we need to click on the stats container in the TopBar to expand the details
    cy.get("span").contains("Class").click();
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
