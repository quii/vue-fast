import ScorePage from "../pages/scorePage";
import { ruthsFrostbiteGame, ruthsGame } from "../../src/domain/test_data";
import HistoryPage from "../pages/historyPage";

describe(`Smoke test using Ruth's game`,
  () => {
    const scorePage = new ScorePage();
    const historyPage = new HistoryPage();

    beforeEach(() => {
      scorePage.visit();
      scorePage.clearData();
    });

    it("records all the scores and calculates the totals for an imperial game", () => {
      scorePage.selectGame("WINDSOR");
      scorePage.score(ruthsGame);

      scorePage.checkTotalHits("108");
      scorePage.checkTotalScore("804");
      scorePage.checkTotalGolds("56");
    });

    it("also works for a frostbite game", () => {
      scorePage.selectGame("FROSTBITE");
      scorePage.score(ruthsFrostbiteGame);

      scorePage.checkSubTotalScore("254");
      scorePage.checkSubTotalGolds("4");
    });

    const zeroBugScores = [
      9,
      1,
      1,
      1,
      "M",
      "M",
      8,
      6,
      5,
      5,
      5,
      3,
      7,
      6,
      5,
      5,
      4,
      3,
      8,
      5,
      5,
      2,
      1,
      "M",
      8,
      7,
      7,
      6,
      2,
      2,
      9,
      8,
      8,
      6,
      5,
      4,
      8,
      8,
      6,
      3,
      "M",
      "M",
      7,
      5,
      5,
      4,
      4,
      "M",
      6,
      5,
      1,
      1,
      "M",
      "M",
      "X",
      6,
      6,
      1,
      1,
      "M",
      10,
      6,
      5,
      5,
      4,
      4,
      6,
      5,
      4,
      4,
      "M",
      "M"
    ];

    it("should record the actual score in the history, not 0", () => {
      scorePage.selectGame("WA 70M");
      scorePage.score(zeroBugScores);

      const expectedScore = "307";
      scorePage.checkSubTotalScore(expectedScore);
      scorePage.save();

      historyPage.navigateTo();
      historyPage.checkRecordExists(expectedScore);
    });

  });