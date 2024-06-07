import ScorePage from "../pages/scorePage";

describe("score buttons", () => {
  const scorePage = new ScorePage();

  it("when a 7 is scored in an end for imperial, you cannot enter a 9", () => {
    scorePage.visit();
    scorePage.clearData();
    scorePage.selectGame("WINDSOR");

    scorePage.score(7);
    scorePage.checkButtonState("9", "be.disabled");
    scorePage.checkButtonState("7", "be.enabled");
  });

  it("when the end is over, the button should be re-enabled", () => {
    scorePage.visit();
    scorePage.clearData();
    scorePage.selectGame("WINDSOR");

    scorePage.score(7);
    scorePage.checkButtonState("9", "be.disabled");

    Cypress._.times(5, () => {
      scorePage.score(7);
    });

    scorePage.checkButtonState("9", "be.enabled");
  });

  it("when a 10 is scored with a metric, you can no longer score an X", () => {
    scorePage.visit();
    scorePage.clearData();
    scorePage.selectGame("METRIC III");

    scorePage.score(10);
    scorePage.checkButtonState("X", "be.disabled");
  });

  it("works with wonky 2.5 round length games like Bray I", () => {
    scorePage.visit();
    scorePage.clearData();
    scorePage.selectGame("BRAY I");

    Cypress._.times(30, () => {
      scorePage.score(10);
    });

    scorePage.checkButtonState("10", "be.disabled");
  });
});