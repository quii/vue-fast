import DataManagementPage from "../pages/dataManagementPage";
import HistoryPage from "../pages/historyPage";
import ScorePage from '../pages/scorePage'


describe("data management", () => {
  const dataManagementPage = new DataManagementPage();
  const historyPage = new HistoryPage();
  const scorePage = new ScorePage()

  beforeEach(() => {
    scorePage.visit()
    dataManagementPage.navigateTo();
    dataManagementPage.resetData();
  });

  it("imports data from backup file", () => {
    dataManagementPage.importData("cypress/fixtures/backup-data.json");

    historyPage.navigateTo();
    historyPage.selectHistoryItem('28/06/23')
    historyPage.checkTotalGolds("1");
    historyPage.checkNoteExists("Test note");
  });
});

