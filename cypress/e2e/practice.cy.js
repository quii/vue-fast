import ScorePage from "../pages/scorePage";

describe("practicing", () => {
  const scorePage = new ScorePage();

  beforeEach(() => {
    cy.viewport(380, 844, "portrait");
  });
  it("can pick a practice and score", () => {
    scorePage.visit();
    scorePage.clearData();
    scorePage.selectGame("PRACTICE 60YD");

    scorePage.score(7);
    scorePage.assertButtonIsEnabled("7");
    scorePage.assertButtonIsDisabled("9");
  });
});