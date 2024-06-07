import { ruthsFrostbiteGame, ruthsGame } from "../../src/domain/test_data";

describe(`Smoke test using Ruth's game`, () => {
  it("records all the scores and calculates the totals for an imperial game", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        delete win.navigator.__proto__.serviceWorker;
      }
    });
    cy.get("button").contains("Clear data").click();
    cy.get('select').select('WINDSOR')

    ruthsGame.forEach((score) => {
      cy.score(score);
    })
    // get button by data attribute data-test="totalHits"
    cy.get('[data-test="totalHits"]').contains('108')
    cy.get('[data-test="totalScore"]').contains('804')
    cy.get('[data-test="totalGolds"]').contains('56')

    cy.get("button").contains("Clear data").click();

    // next game
    cy.get("select").select("FROSTBITE");
    ruthsFrostbiteGame.forEach((score) => {
      cy.score(score);
    });

    cy.get(`[data-test="totalScore"]`).contains("254");
    cy.get("[data-test=\"totalGolds\"]").contains("8");

  })
})