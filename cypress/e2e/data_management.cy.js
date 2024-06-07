import { cjSave, mallySave } from "../../src/domain/test_data";
import DataManagementPage from "../pages/dataManagementPage";
import HistoryPage from "../pages/historyPage";
import ScorePage from "../pages/scorePage";


describe("data management", () => {
  const dataManagementPage = new DataManagementPage();
  const historyPage = new HistoryPage();
  const scorePage = new ScorePage();

  it("import cj save and view history", () => {
    dataManagementPage.navigateTo();
    dataManagementPage.resetData();
    dataManagementPage.importData(cjSave);

    historyPage.navigateTo();
    historyPage.selectHistoryItem("Sat, 20 Apr 2024");
    historyPage.checkTotalGolds("19");
  });

  it("import Mally's game, view history", () => {
    dataManagementPage.navigateTo();
    dataManagementPage.resetData();
    dataManagementPage.importData(mallySave);

    historyPage.navigateTo();
    historyPage.selectHistoryItem("Sun, 5 May 2024");
    historyPage.checkTotalGolds("9");
  });

  it("fresh data", () => {
    dataManagementPage.navigateTo();
    dataManagementPage.resetData();

    scorePage.navigateTo();
    scorePage.selectGame("WINDSOR");
    Cypress._.times(12 * 9, () => {
      scorePage.score(9);
    });
    scorePage.save();

    historyPage.navigateTo();
    historyPage.selectHistoryItem("windsor");
    historyPage.checkTotalGolds("108");
  })
});
