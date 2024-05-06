import { cjSave, ruthsFrostbiteGame, ruthsGame } from "../../src/domain/test_data";

describe(`Smoke test using Ruth's game`, () => {
  it("records all the scores and calculates the totals for an imperial game", () => {
    cy.visit('/')
    cy.get("button").contains("Clear data").click();
    cy.get('select').select('WINDSOR')

    ruthsGame.forEach((score) => {
      // press button with text value score
      cy.get('button').contains(score).click()
    })
    // get button by data attribute data-test="totalHits"
    cy.get('[data-test="totalHits"]').contains('108')
    cy.get('[data-test="totalScore"]').contains('804')
    cy.get('[data-test="totalGolds"]').contains('56')

    cy.get("button").contains("Clear data").click();

    // next game
    cy.get("select").select("FROSTBITE");
    ruthsFrostbiteGame.forEach((score) => {
      cy.get("button").contains(score).click();
    });

    cy.get(`[data-test="totalScore"]`).contains("254");
    cy.get("[data-test=\"totalGolds\"]").contains("8");

    // cant do this as separate tests i dont know why
    cy.get("a").contains("Data").click();
    cy.get("button").contains("Reset").click();

    const rawCJData = JSON.stringify(cjSave);
    cy.get("textarea").type(rawCJData, { parseSpecialCharSequences: false, delay: 0 });
    cy.get("button").contains("Import").click();
    cy.get("a").contains("History").click();
    cy.get("td").contains("Sat, 20 Apr 2024").click();
    cy.get("[data-test=\"totalGolds\"]").contains("19");
  })
})