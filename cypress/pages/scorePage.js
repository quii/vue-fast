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

  selectPractice(distance) {
    cy.get(".current-round-container").click();

    // Check if the profile setup form is visible and fill it out if needed
    cy.get("body").then(($body) => {
      if ($body.find(".profile-setup-section").length > 0) {
        // Fill out the profile form with senior, male, recurve
        cy.get("#age-group").select("senior");
        cy.get("#gender").select("male");
        cy.get("#bow-type").select("recurve");
      }
    });

    cy.get(".filter-label").contains("Practice").click();

    const gameName = `Practice ${distance}`;

    // If there's a search input, use it to find the round faster
    cy.get(".search-container input").then($input => {
      if ($input.length) {
        cy.wrap($input).clear().type(gameName);
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

  selectGame(gameName) {
    // Click the select button to open the modal
    cy.get(".current-round-container").click();

    // Check if the profile setup form is visible and fill it out if needed
    cy.get("body").then(($body) => {
      if ($body.find(".profile-setup-section").length > 0) {
        // Fill out the profile form with senior, male, recurve
        cy.get("#age-group").select("senior");
        cy.get("#gender").select("male");
        cy.get("#bow-type").select("recurve");
      }
    });

    // If there's a search input, use it to find the round faster
    cy.get(".search-container input").then($input => {
      if ($input.length) {
        cy.wrap($input).clear().type(gameName);
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
    cy.get("span").contains("Note").click();
    cy.get("#noteTakerTextArea").type(noteText);
    cy.get("button").contains("💾 Save note").click();
  }

  highlightNote(noteText) {
    cy.get("[data-test=\"note-text\"]").contains(noteText).click();
  }

  clickClassificationDetails() {
    // Now we need to click on the stats container in the TopBar to expand the details
    cy.get("span").contains("Class").click();
  }

  checkClassificationTable(expectedClassification, shortBy) {
    // First ensure the classification details are expanded
    cy.get(".classification-details-container").should("be.visible");

    // Then check for the classification and shortBy value
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

