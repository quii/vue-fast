import ScorePage from "../pages/scorePage";
import HistoryPage from "../pages/historyPage";
import { userDataPage } from "../pages/userDataPage";

describe("Notes and Classifications", () => {
  const scorePage = new ScorePage();
  const historyPage = new HistoryPage();

  beforeEach(() => {
    scorePage.visit();
    scorePage.clearData();
  });

  it("records scores with notes and persists them", () => {
    userDataPage.navigateTo();
    userDataPage.setArcherDetails("male", "recurve", "senior");

    scorePage.navigateTo();
    scorePage.selectGame("BRAY I");

    // First end of 6
    scorePage.score([10, 9, 9, 8, 8, 7]);
    scorePage.expandClassificationDetails();
    scorePage.checkClassificationTable("A2", "121");
    scorePage.checkOnTrackStatus(true);
    scorePage.addNote("Good grouping on the 9s");

    // Second end of 6
    scorePage.score([9, 8, 8, 7, 7, 6]);

    // Third end of 6
    scorePage.score([8, 7, 7, 6, 6, 5]);
    scorePage.addNote("Form getting worse, need to focus");
    scorePage.highlightNote("Form getting worse, need to focus");

    // Fill remaining ends with consistent scoring pattern
    for (let i = 0; i < 2; i++) {
      scorePage.score([10, 9, 9, 8, 8, 2]);
    }

    scorePage.checkClassificationAchieved("A1");
    scorePage.checkClassificationMissed("B3");

    scorePage.save();

    historyPage.navigateTo();
    historyPage.checkClassificationExists("232", "A1");

    historyPage.selectHistoryItem("227");
    historyPage.checkNoteIsHighlighted("Form getting worse, need to focus");
  });

  it("shows progression through classifications during shooting", () => {
    userDataPage.navigateTo();
    userDataPage.setArcherDetails("male", "recurve", "senior");
    scorePage.navigateTo();

    scorePage.selectGame("WINDSOR");
    // Enter first score to make classification table visible
    scorePage.score([5, 5, 3, 3, 1, 1]);

    scorePage.expandClassificationDetails();
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

    scorePage.selectGame("WINDSOR");
    scorePage.score([9, 9, 9, 9, 7, 5]); // Initial score to show classifications
    scorePage.expandClassificationDetails();

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

