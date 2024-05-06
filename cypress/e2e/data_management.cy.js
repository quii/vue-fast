import { cjSave, mallySave } from "../../src/domain/test_data";

describe("data management", () => {
  it("import cj save and view history", () => {
    cy.visit("/");
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
    cy.visit("/");
    cy.get("a").contains("Data").click();
    cy.get("button").contains("Reset").click();

    const rawMallyData = JSON.stringify(mallySave);
    cy.get("textarea").type(rawMallyData, { parseSpecialCharSequences: false, delay: 0 });
    cy.get("button").contains("Import").click();
    cy.visit("/"); //let the data fixer do its thing
    cy.get("a").contains("History").click();
    cy.get("td").contains("Sun, 5 May 2024").click();
    cy.get("[data-test=\"totalGolds\"]").contains("9");
  });
});
