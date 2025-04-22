import ScorePage from "../pages/scorePage";
import { userDataPage } from "../pages/userDataPage";

describe("Round recommendations", () => {
  it("shows appropriate rounds based on archer's max distance", () => {
    const scorePage = new ScorePage();

    scorePage.visit()
    scorePage.navigateTo()
    userDataPage.navigateTo();
    userDataPage.setArcherDetails("male", "recurve", "senior");
    userDataPage.setClassification("A1");

    scorePage.navigateTo();
    scorePage.tapRoundSelector();
    scorePage.setMaxDistance(50);

    scorePage.checkRoundRecommendation("Windsor", false);
    scorePage.checkRoundRecommendation("National", false);

    scorePage.setMaxDistance(60);

    scorePage.checkRoundRecommendation("Windsor");
    scorePage.checkRoundRecommendation("National");
  });
});