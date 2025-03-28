class ScorePage {
  visit() {
    cy.visit("/");
  }

  navigateTo() {
    cy.get("a").contains("📝 Scoring").click();
  }

  clearData() {
    cy.get("body").then(($body) => {
      if ($body.find("#clear").length > 0) {
        cy.get("#clear").click();
      }
    });
  }

  selectGame(gameName) {
    // Click the select button to open the modal
    cy.get(".current-round-container").click();

    // If there's a search input, use it to find the round faster
    cy.get(".search-container input").then($input => {
      if ($input.length) {
        cy.wrap($input).type(gameName);
      }
    });

    // Find the round card with the exact matching round name
    // We need to be more precise to avoid selecting rounds that contain the name as a substring
    cy.get(".rounds-container .round-name").each(($el) => {
      const text = $el.text().trim().toLowerCase();
      const searchName = gameName.toLowerCase();

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
    cy.get("button").contains("Save").click();
  }

  assertButtonIsDisabled(buttonValue) {
    this.checkButtonState(buttonValue, "be.disabled");
  }

  assertButtonIsEnabled(buttonValue) {
    this.checkButtonState(buttonValue, "be.enabled");
  }

  addNote(noteText) {
    cy.get("button").contains("Take a note").click();
    cy.get("#noteTakerTextArea").type(noteText);
    cy.get("button").contains("💾 Save note").click();
  }

  highlightNote(noteText) {
    cy.get("[data-test=\"note-text\"]").contains(noteText).click();
  }

  expandClassificationDetails() {
    cy.contains("Classification Details").click();
  }

  checkClassificationTable(expectedClassification, shortBy) {
    cy.get(".classification-table-container").within(() => {
      // Find the row containing the classification
      cy.contains(".classification-badge", expectedClassification)
        .closest(".table-row")
        .within(() => {
          if (shortBy) {
            // Look for the shortBy value in the score cell
            cy.get(".score-cell").contains(`(-${shortBy})`);
          }
        });
    });
  }

  checkOnTrackStatus(isOnTrack) {
    if (isOnTrack) {
      cy.get(".onTrack").should("exist");
    } else {
      cy.get(".offTrack").should("exist");
    }
  }

  checkClassificationAchieved(classification) {
    cy.get("#classification").within(() => {
      cy.contains(".classification-badge", classification)
        .closest(".table-row")
        .should("have.class", "achieved");
    });
  }

  checkClassificationMissed(classification) {
    cy.get("#classification").within(() => {
      cy.contains(".classification-badge", classification)
        .closest(".table-row")
        .should("not.have.class", "achieved");
    });
  }
}

export default ScorePage;

