import ScorePage from "../pages/scorePage";
import { ruthsFrostbiteGame, ruthsGame } from "../../src/domain/test_data";

describe(`Smoke test using Ruth's game`, () => {
  const scorePage = new ScorePage();

  it("records all the scores and calculates the totals for an imperial game", () => {
    scorePage.visit();
    scorePage.clearData();
    scorePage.selectGame("WINDSOR");

    ruthsGame.forEach((score) => {
      scorePage.score(score);
    });

    scorePage.checkTotalHits("108");
    scorePage.checkTotalScore("804");
    scorePage.checkTotalGolds("56");

    scorePage.clearData();

    // next game
    scorePage.selectGame("FROSTBITE");
    ruthsFrostbiteGame.forEach((score) => {
      scorePage.score(score);
    });

    scorePage.checkTotalScore("254");
    scorePage.checkTotalGolds("8");
  });
});