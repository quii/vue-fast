import ScorePage from "../pages/scorePage";
import HistoryPage from "../pages/historyPage";

describe("practicing", () => {
  const scorePage = new ScorePage();
  const historyPage = new HistoryPage();

  beforeEach(() => {
    cy.viewport(380, 844, "portrait");
    scorePage.visit();
    scorePage.clearData();
  });

  it("can pick a practice and score", () => {
    scorePage.selectGame("PRACTICE 60YD");

    scorePage.score(7);
    scorePage.assertButtonIsEnabled("7");
    scorePage.assertButtonIsDisabled("9");
  });

  it("can save practice scores at any point without reaching max arrows", () => {
    // Select a practice round
    scorePage.selectGame("PRACTICE 50M");

    // Score just 2 arrows
    const practiceScores = [9, 7];
    scorePage.score(practiceScores);

    // Calculate expected total score
    const expectedScore = "16";

    // Verify the current score before saving
    scorePage.checkSubTotalScore(expectedScore);
    scorePage.save();

    historyPage.navigateTo();

    historyPage.checkScoreExists(expectedScore, "practice 50m");
  });
});
