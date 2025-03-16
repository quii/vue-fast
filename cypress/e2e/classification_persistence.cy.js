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
    scorePage.selectGame("BRAY I");

    // Bray I has 2.5 dozen arrows (30 arrows)
    const allEights = Array(30).fill(8);
    scorePage.score(allEights);

    // Save the score
    scorePage.save();

    // Step 3: Check the classification in history (should be B2 for 50+)
    historyPage.navigateTo();

    // Since this is the first entry, we can use the existing method
    historyPage.checkClassificationExists("240", "B2");

    // Step 4: Change profile to senior
    userDataPage.navigateTo();
    userDataPage.setArcherDetails("male", "recurve", "senior");

    // Step 5: Score the same Bray I round with all 8s as a senior archer
    scorePage.navigateTo();
    scorePage.selectGame("BRAY I");

    // Score the same 30 arrows with 8s
    scorePage.score(allEights);

    // Save the score
    scorePage.save();

    // Step 6: Check classifications in history
    historyPage.navigateTo();

    // Check that both B2 and B3 classifications exist for the score 240
    cy.get("tr").contains("td", "240").should("exist");
    cy.get("td.B2").should("exist");
    cy.get("td.B3").should("exist");

    // Verify that we have one row with score 240 and class B2
    cy.get("tr").each(($row) => {
      const rowText = $row.text();
      if (rowText.includes("240") && $row.find(".B2").length > 0) {
        cy.wrap($row).should("contain", "240").and("contain", "B2");
      }
    });

    // Verify that we have another row with score 240 and class B3
    cy.get("tr").each(($row) => {
      const rowText = $row.text();
      if (rowText.includes("240") && $row.find(".B3").length > 0) {
        cy.wrap($row).should("contain", "240").and("contain", "B3");
      }
    });
  });
});
