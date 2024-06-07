class ScorePage {
  visit() {
    cy.visit("/", {
      onBeforeLoad(win) {
        delete win.navigator.__proto__.serviceWorker;
      }
    });
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
}

export default ScorePage;