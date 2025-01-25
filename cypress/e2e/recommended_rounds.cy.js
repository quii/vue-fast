import { userDataPage } from "../pages/userDataPage";

describe("Round recommendations", () => {
  it("shows appropriate rounds based on archer's max distance", () => {
    cy.visit("/");
    userDataPage.navigateTo();
    userDataPage.setArcherDetails("male", "recurve", "senior");
    userDataPage.setClassification("A1");
    userDataPage.setMaxDistance(50);

    userDataPage.checkRoundRecommendation("windsor", false);
    userDataPage.checkRoundRecommendation("national", false);

    userDataPage.setMaxDistance(60);

    userDataPage.checkRoundRecommendation("windsor");
    userDataPage.checkRoundRecommendation("national");
  });
});