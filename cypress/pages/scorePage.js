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
    cy.get("select").select(gameName);
  }

  score(input) {
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
    cy.get("button").contains("📝 Take a note").click();
    cy.get("#noteTakerTextArea").type(noteText);
    cy.get("button").contains("💾 Save note").click();
  }

  highlightNote(noteText) {
    cy.get("[data-test=\"note-text\"]").contains(noteText).click();
  }

  expandClassificationDetails() {
    cy.contains("Tap to view classification calculations").click();
  }

  checkClassificationTable(expectedClassification, shortBy) {
    cy.get("#classification").within(() => {
      cy.contains("tr", expectedClassification).within(() => {
        if (shortBy) {
          cy.contains(`(-${shortBy})`);
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
      cy.contains("tr", classification).should("have.class", "achieved");
    });
  }

  checkClassificationMissed(classification) {
    cy.get("#classification").within(() => {
      cy.contains("tr", classification).should("not.have.class", "achieved");
    });
  }
}

export default ScorePage;

