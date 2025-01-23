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
    scorePage.selectGame("WINDSOR");

    // First end of 6
    scorePage.score([9, 9, 7, 7, 5, 5]);
    scorePage.expandClassificationDetails();
    scorePage.checkClassificationTable("A2", "560");
    scorePage.checkOnTrackStatus(true);
    scorePage.addNote("Good grouping on the 9s");

    // Second end of 6
    scorePage.score([9, 7, 7, 5, 5, 3]);

    // Third end of 6
    scorePage.score([7, 7, 5, 5, 3, 3]);
    scorePage.addNote("Form getting worse, need to focus");
    scorePage.highlightNote("Form getting worse, need to focus");

    // Fill the rest with valid scoring patterns
    for (let i = 0; i < 15; i++) {
      scorePage.score([9, 9, 7, 7, 5, 5]);
    }

    scorePage.checkClassificationAchieved("A1");
    scorePage.checkClassificationMissed("B3");

    scorePage.save();

    historyPage.navigateTo();
    historyPage.checkClassificationExists("738", "A1");

    historyPage.selectHistoryItem("738");

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

