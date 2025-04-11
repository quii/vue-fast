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

    // Check if the profile setup form is visible and fill it out if needed
    cy.get("body").then(($body) => {
      if ($body.find(".profile-setup-section").length > 0) {
        // Fill out the profile form with senior, male, recurve
        cy.get("#age-group").select("senior");
        cy.get("#gender").select("male");
        cy.get("#bow-type").select("recurve");
      }
    });

    // Apply filter if specified
    if (filterType) {
      cy.get(".filter-label").contains(filterType).click();
    }

    // Try to find the search input, but don't fail if it doesn't exist
    cy.get("body").then($body => {
      // If search container exists, use it
      if ($body.find(".search-container input").length > 0) {
        cy.get(".search-container input").clear().type(roundName);
      }
    });

    // Find the round card with the exact matching round name
    cy.get(".rounds-container .round-name").each(($el) => {
      const text = $el.text().trim().toLowerCase();
      const searchName = roundName.toLowerCase();

      // Check for exact match or match with formatting differences
      if (text === searchName ||
        text === searchName.charAt(0).toUpperCase() + searchName.slice(1) ||
        // Handle special case for rounds with roman numerals
        text.replace(/\s+/g, " ") === searchName.replace(/\s+/g, " ")) {
        cy.wrap($el).click();
        return false; // Break the each loop
      }
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
    cy.contains("Save to history").click();
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

  checkOnTrackStatus(isOnTrack) {
    // First ensure the classification details are expanded
    cy.get(".classification-details-container").should("be.visible");

    if (isOnTrack) {
      cy.get(".avgOnTrack").should("exist");
    } else {
      cy.get(".avgOffTrack").should("exist");
    }
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
