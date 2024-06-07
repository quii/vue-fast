import ScorePage from "../pages/scorePage";

describe("score buttons", () => {
  const scorePage = new ScorePage();

  beforeEach(() => {
    scorePage.visit();
    scorePage.clearData();
  });

  it("when a 7 is scored in an end for imperial, you cannot enter a 9", () => {
    scorePage.selectGame("WINDSOR");

    scorePage.score(7);
    scorePage.checkButtonState("9", "be.disabled");
    scorePage.checkButtonState("7", "be.enabled");
  });

  it("when the end is over, all buttons should be re-enabled", () => {
    scorePage.selectGame("WINDSOR");

    scorePage.score(7);
    scorePage.checkButtonState("9", "be.disabled");

    scorePage.times(5).score(7);
    scorePage.checkButtonState("9", "be.enabled");
  });

  it("when a 10 is scored with a metric, you can no longer score an X", () => {
    scorePage.selectGame("METRIC III");
    scorePage.score(10);
    scorePage.checkButtonState("X", "be.disabled");
  });

  it("works with wonky 2.5 round length games like Bray I", () => {
    scorePage.selectGame("BRAY I");
    scorePage.times(30).score(10);
    scorePage.checkButtonState("10", "be.disabled");
  });

  it("understands worcester rules", () => {
    scorePage.selectGame("WORCESTER");

    scorePage.score("X");
    scorePage.checkButtonState("X", "be.enabled");
    scorePage.score("5");
    scorePage.checkButtonState("X", "be.disabled");
    scorePage.checkTotalScore("10");
  });
});