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
}

export default HistoryPage;