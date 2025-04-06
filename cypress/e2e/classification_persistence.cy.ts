import ScorePage from "../pages/scorePage";
import HistoryPage from "../pages/historyPage";
import { UserDataPage } from "../pages/userDataPage";

describe("Classification Persistence", () => {
  const scorePage = new ScorePage();
  const historyPage = new HistoryPage();
  const userDataPage = new UserDataPage();

  beforeEach(() => {
    scorePage.visit();
    scorePage.clearData();
  });

  it("maintains historical classifications when user profile changes", () => {
    // Step 1: Set profile to 50+
    userDataPage.navigateTo();
    userDataPage.setArcherDetails("male", "recurve", "50+");

    // Step 2: Score a Bray I round with all 8s as a 50+ archer
    scorePage.navigateTo();
    scorePage.selectGame("Bray I");

    // Bray I has 2.5 dozen arrows (30 arrows)
    const allEights = Array(30).fill(8);
    scorePage.score(allEights);

    // Save the score
    scorePage.save();

    // Step 3: Check the classification in history (should be B2 for 50+)
    historyPage.navigateTo();

    // Use the historyPage page object method to check classification
    historyPage.checkClassificationExists("240", "B2");

    // Step 4: Change profile to senior
    userDataPage.navigateTo();
    userDataPage.setArcherDetails("male", "recurve", "senior");

    // Step 5: Score the same Bray I round with all 8s as a senior archer
    scorePage.navigateTo();
    scorePage.selectGame("Bray I");

    // Score the same 30 arrows with 8s
    scorePage.score(allEights);

    // Save the score
    scorePage.save();

    // Step 6: Check classifications in history
    historyPage.navigateTo();

    // Check that both scores exist with their respective classifications
    historyPage.checkClassificationExists("240", "B2");

    // Check that the second entry has B3 classification
    // We need to add a method to the historyPage object to check for multiple classifications

    // Check that we have both B2 and B3 classifications for score 240
    cy.get(".history-card").then($cards => {
      // Find cards with score 240
      const scoreCards = $cards.filter((_, card) => {
        return Cypress.$(card).find(".card-score").text().includes("240");
      });

      // Verify we have exactly 2 cards with score 240
      expect(scoreCards.length).to.equal(2);

      // Check that one has B2 and one has B3
      const b2Cards = scoreCards.filter((_, card) => {
        return Cypress.$(card).find(".classification-name").text().includes("B2");
      });

      const b3Cards = scoreCards.filter((_, card) => {
        return Cypress.$(card).find(".classification-name").text().includes("B3");
      });

      expect(b2Cards.length).to.equal(1);
      expect(b3Cards.length).to.equal(1);
    });
  });
});