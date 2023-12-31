import { ruthsFrostbiteGame, ruthsGame } from "../../src/domain/test_data";

describe(`Smoke test using Ruth's game`, () => {
  it("records all the scores and calculates the totals for an imperial game", () => {
    cy.visit('/')
    cy.get("button").contains("Clear data").click();
    cy.get('button').contains('windsor').click()

    ruthsGame.forEach((score) => {
      // press button with text value score
      cy.get('button').contains(score).click()
    })
    // get button by data attribute data-test="totalHits"
    cy.get('[data-test="totalHits"]').contains('108')
    cy.get('[data-test="totalScore"]').contains('804')
    cy.get('[data-test="totalGolds"]').contains('56')

    cy.get("button").contains("Clear data").click();
    cy.get("button").contains("frostbite").click();

    ruthsFrostbiteGame.forEach((score) => {
      cy.get("button").contains(score).click();
    });

    cy.get(`[data-test="totalScore"]`).contains("254");
    cy.get("[data-test=\"totalGolds\"]").contains("8");

  })
})
