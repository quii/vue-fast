import { cjSave, mallySave } from "../../src/domain/test_data";

//service worker nonsense: https://github.com/cypress-io/cypress/issues/27501

describe("data management", () => {
  it("import cj save and view history", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        delete win.navigator.__proto__.serviceWorker;
      }
    });
    cy.get("a").contains("Data").click();
    cy.get("button").contains("Reset").click();

    const rawCJData = JSON.stringify(cjSave);
    cy.get("textarea").type(rawCJData, { parseSpecialCharSequences: false, delay: 0 });
    cy.get("button").contains("Import").click();
    cy.get("a").contains("History").click();
    cy.get("td").contains("Sat, 20 Apr 2024").click();
    cy.get("[data-test=\"totalGolds\"]").contains("19");
  });

  it("import Mally's game, view history", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        delete win.navigator.__proto__.serviceWorker;
      }
    });
    cy.get("a").contains("Data").click();
    cy.get("button").contains("Reset").click();

    const rawMallyData = JSON.stringify(mallySave);
    cy.get("textarea").type(rawMallyData, { parseSpecialCharSequences: false, delay: 0 });
    cy.get("button").contains("Import").click();
    // cy.visit("/"); //let the data fixer do its thing
    cy.get("a").contains("History").click();
    cy.get("td").contains("Sun, 5 May 2024").click();
    cy.get("[data-test=\"totalGolds\"]").contains("9");
  });

  it("fresh data", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        delete win.navigator.__proto__.serviceWorker;
      }
    });
    cy.get("a").contains("Data").click();
    cy.get("button").contains("Reset").click();

    cy.get("a").contains("📝 Scoring").click();
    cy.get("select").select("WINDSOR");

    Cypress._.times(12 * 9, () => {
      cy.get("button").contains("9").click();
    });

    cy.get("button").contains("Save").click();
    cy.get("a").contains("History").click();
    cy.get("td").contains("windsor").click();
    cy.get("[data-test=\"totalGolds\"]").contains("108");
  })
});
