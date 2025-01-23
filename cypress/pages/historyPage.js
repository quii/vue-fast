class HistoryPage {
  navigateTo() {
    cy.get("a").contains("History").click();
  }

  selectHistoryItem(item) {
    cy.get("td").contains(item).click();
  }

  checkTotalGolds(expectedGolds) {
    cy.get("[data-test=\"totalGolds\"]").contains(expectedGolds);
  }

  checkRecordExists(score) {
    // get element with class highlight and check it contains score exactly
    cy.get(".highlight").contains(score);
  }

  checkNoteExists(noteText) {
    cy.get("[data-test=\"note-text\"]").contains(noteText);
  }

  checkNoteIsHighlighted(noteText) {
    cy.get("[data-test=\"note-row\"].highlighted").contains(noteText);
  }

  checkClassificationExists(score, classification) {
    cy.get("tr")
      .contains("td", score)
      .parent()
      .contains("td", classification);
  }

}

export default HistoryPage;