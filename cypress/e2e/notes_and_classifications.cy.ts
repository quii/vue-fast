import ScorePage from "../pages/scorePage";
import HistoryPage from "../pages/historyPage";
import { userDataPage } from "../pages/userDataPage";

describe("Notes and Classifications", () => {
  const scorePage = new ScorePage();
  const historyPage = new HistoryPage();

  beforeEach(() => {
    cy.disableAllTips()
    scorePage.visit();
    scorePage.clearData();
  });

  xit('records scores with notes and persists them', () => {
    cy.get('.dismiss-button').click()

    userDataPage.navigateTo();
    userDataPage.setArcherDetails("male", "recurve", "senior");

    scorePage.navigateTo();
    scorePage.selectGame("Bray I");

    // First end of 6
    scorePage.score([10, 9, 9, 8, 8, 7]);
    // scorePage.clickClassificationDetails();
    // scorePage.checkClassificationTable("A2", "121");
    // scorePage.clickClassificationDetails()
    // scorePage.checkOnTrackStatus(true);
    scorePage.addNote("Good grouping on the 9s");

    // Second end of 6
    scorePage.score([9, 8, 8, 7, 7, 6]);

    // Third end of 6
    scorePage.score([8, 7, 7, 6, 6, 5]);
    scorePage.addNote("Form getting worse, need to focus");
    // Add an explicit wait to ensure the note is rendered
    scorePage.highlightNote("Form getting worse, need to focus");

    // Fill remaining ends with consistent scoring pattern
    for (let i = 0; i < 2; i++) {
      scorePage.score([10, 9, 9, 8, 8, 2]);
    }

    scorePage.save()
    scorePage.clickClassificationDetails()
    scorePage.checkClassificationAchieved("A1");
    scorePage.checkClassificationMissed("B3");
    scorePage.clickClassificationDetails();

    historyPage.navigateTo();
    historyPage.checkClassificationExists("227", "A1");

    historyPage.selectHistoryItem("227");
    historyPage.checkNoteIsHighlighted("Form getting worse, need to focus");
  });

  it("shows progression through classifications during shooting", () => {
    userDataPage.navigateTo();
    userDataPage.setArcherDetails("male", "recurve", "senior");
    scorePage.navigateTo();

    scorePage.selectGame("Windsor");
    // Enter first score to make classification table visible
    scorePage.score([5, 5, 3, 3, 1, 1]);

    scorePage.clickClassificationDetails();
    scorePage.checkClassificationMissed("A3");

    for (let i = 0; i < 5; i++) {
      scorePage.score([9, 9, 9, 7, 7, 7]);
    }
    scorePage.checkClassificationMissed("A3");

    for (let i = 0; i < 6; i++) {
      scorePage.score([9, 9, 9, 7, 7, 7]);
    }
    scorePage.checkClassificationAchieved("A3");
    scorePage.checkClassificationMissed("A2");

    for (let i = 0; i < 6; i++) {
      scorePage.score([9, 9, 9, 7, 7, 7]);
    }

    scorePage.checkClassificationAchieved("B3");


    scorePage.save();
    historyPage.navigateTo();
    historyPage.checkClassificationExists("834", "B3");
  });

  it("handles classification boundaries precisely", () => {
    userDataPage.navigateTo();
    userDataPage.setArcherDetails("male", "recurve", "senior");
    scorePage.navigateTo();

    scorePage.selectGame("Windsor");
    scorePage.score([9, 9, 9, 9, 7, 5]); // Initial score to show classifications
    scorePage.clickClassificationDetails();

    // Score exactly A3 (490)
    for (let i = 0; i < 17; i++) {
      scorePage.score([5, 5, 5, 5, 3, 3]); // 26 points per end
    }
    scorePage.checkClassificationAchieved("A3");
    scorePage.checkClassificationMissed("A2");

    scorePage.save();
    historyPage.navigateTo();
    historyPage.checkClassificationExists("490", "A3");
  });

});
