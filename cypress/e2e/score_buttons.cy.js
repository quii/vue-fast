describe("score buttons", () => {
  it("when a 7 is scored in an end for imperial, you cannot enter a 9", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        delete win.navigator.__proto__.serviceWorker;
      }
    });
    cy.get("button").contains("Clear data").click();
    cy.get("select").select("WINDSOR");

    cy.get("button").contains("7").click();
    cy.get("button").contains("9").should("be.disabled");
    cy.get("button").contains("7").should("be.enabled");
  });

  it("when the end is over, the button should be re-enabled", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        delete win.navigator.__proto__.serviceWorker;
      }
    });
    cy.get("button").contains("Clear data").click();
    cy.get("select").select("WINDSOR");

    cy.get("button").contains("7").click();
    cy.get("button").contains("9").should("be.disabled");

    Cypress._.times(5, () => {
      cy.get("button").contains("7").click();
    });

    cy.get("button").contains("9").should("be.enabled");
  });

  it("when a 10 is scored with a metric, you can no longer score an X", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        delete win.navigator.__proto__.serviceWorker;
      }
    });
    cy.get("button").contains("Clear data").click();
    cy.get("select").select("WA 25M");

    cy.get("button").contains("10").click();
    cy.get("button").contains("X").should("be.disabled");
  });
});