class ScorePage {
  visit() {
    cy.visit("/", {
      onBeforeLoad(win) {
        //service worker nonsense: https://github.com/cypress-io/cypress/issues/27501
        delete win.navigator.__proto__.serviceWorker;
      }
    });
  }

  navigateTo() {
    cy.get("a").contains("📝 Scoring").click();
  }

  clearData() {
    cy.get("button").contains("Clear data").click();
  }

  selectGame(gameName) {
    cy.get("select").select(gameName);
  }

  score(number) {
    cy.get("button").contains(number.toString()).click();
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

  checkTotalGolds(expectedGolds) {
    cy.get("[data-test=\"totalGolds\"]").contains(expectedGolds);
  }

  save() {
    cy.get("button").contains("Save").click();
  }
}

export default ScorePage;