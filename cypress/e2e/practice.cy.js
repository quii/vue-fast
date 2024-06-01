describe("practicing", () => {
  beforeEach(() => {
    cy.viewport("iphone-x", "landscape");
  });
  it("can pick a practice and score", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        delete win.navigator.__proto__.serviceWorker;
      }
    });
    cy.get("button").contains("Clear data").click();
    cy.get("select").select("PRACTICE 60YD");

    cy.get("button").contains("7").click();
    cy.get("button").contains("9").should("be.disabled");
    cy.get("button").contains("7").should("be.enabled");
  });
});