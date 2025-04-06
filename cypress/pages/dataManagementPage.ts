class DataManagementPage {
  navigateTo() {
    cy.visit("/");
    cy.get("a").contains("Data").click();
  }

  resetData() {
    cy.get("button").contains("Reset").click();
  }

  importData(fixturePath) {
    cy.get("[data-test=\"file-upload\"]").selectFile(fixturePath);
  }
}

export default DataManagementPage;
