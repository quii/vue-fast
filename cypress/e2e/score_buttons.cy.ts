import ScorePage from "../pages/scorePage";

describe("score buttons", () => {
  const scorePage = new ScorePage();

  beforeEach(() => {
    scorePage.visit();
    scorePage.clearData();
  });

  it("when a 7 is scored in an end for imperial, you cannot enter a 9", () => {
    scorePage.selectGame("Windsor");

    scorePage.score(7);
    scorePage.assertButtonIsDisabled("9");
    scorePage.assertButtonIsEnabled("7");
  });

  it("when the end is over, all buttons should be re-enabled", () => {
    scorePage.selectGame("Windsor");

    scorePage.score(7);
    scorePage.assertButtonIsDisabled("9");

    scorePage.times(5).score(7);
    scorePage.assertButtonIsEnabled("9");
  });

  it("when a 10 is scored with a metric, you can no longer score an X", () => {
    scorePage.selectGame("Metric III");
    scorePage.score(10);
    scorePage.assertButtonIsDisabled("X");
  });

  it("works with wonky 2.5 round length games like Bray I", () => {
    scorePage.selectGame("Bray I");
    scorePage.times(30).score(10);
    scorePage.assertButtonIsDisabled("10");
  });

  it("understands worcester rules", () => {
    scorePage.selectGame("Worcester");

    scorePage.score("5");
    scorePage.assertButtonIsEnabled('5')
    scorePage.score('4')
    scorePage.assertButtonIsDisabled('5')
    scorePage.checkSubTotalScore('9')
  });

  it("understands vegas 300 rules, which are 10 to 6", () => {
    scorePage.selectGame("Vegas 300");

    scorePage.score("X");
    scorePage.assertButtonIsEnabled("X");
    scorePage.score("10");
    scorePage.assertButtonIsDisabled("X");
    scorePage.score("6");
    scorePage.checkSubTotalScore("26");
  });
});