import { cjSave, mallySave } from "../../src/domain/test_data";
import DataManagementPage from "../pages/dataManagementPage";
import HistoryPage from "../pages/historyPage";
import ScorePage from "../pages/scorePage";


describe("data management", () => {
  const dataManagementPage = new DataManagementPage();
  const historyPage = new HistoryPage();
  const scorePage = new ScorePage();

  beforeEach(() => {
    dataManagementPage.navigateTo();
    dataManagementPage.resetData();
  });

  it("import cj save and view history", () => {
    dataManagementPage.importData(cjSave);

    historyPage.navigateTo();
    historyPage.selectHistoryItem("Sat, 20 Apr 2024");
    historyPage.checkTotalGolds("19");
  });

  it("import Mally's game, view history", () => {
    dataManagementPage.importData(mallySave);

    historyPage.navigateTo();
    historyPage.selectHistoryItem("Sun, 5 May 2024");
    historyPage.checkTotalGolds("9");
  });

  it("fresh data", () => {
    scorePage.navigateTo();
    scorePage.selectGame("WINDSOR");
    scorePage.times(12 * 9).score(9);
    scorePage.save();

    historyPage.navigateTo();
    historyPage.selectHistoryItem("windsor");
    historyPage.checkTotalGolds("108");
  })
});
