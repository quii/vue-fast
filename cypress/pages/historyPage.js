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
}

export default HistoryPage;