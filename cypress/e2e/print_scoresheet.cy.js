import ScorePage from "../pages/scorePage";
import { userDataPage } from "../pages/userDataPage";
import HistoryPage from "../pages/historyPage";

const scorePage = new ScorePage();
const historyPage = new HistoryPage();
describe("Print scoresheet", () => {
  it("prints a complete scoresheet with all archer details and totals", () => {
    cy.window().then((win) => {
      cy.stub(win, "print");
    });
    cy.visit("/");

    userDataPage.navigateTo();
    userDataPage.setArcherDetails("male", "recurve", "senior", "Chris");

    scorePage.navigateTo();
    scorePage.selectGame("Bray i");

    // First dozen
    scorePage.score([9, 8, 7]);
    scorePage.score([8, 8, 8]);
    scorePage.score([7, 7, 7]);
    scorePage.score([9, 9, 9]);

    // Second dozen
    scorePage.score([8, 8, 8]);
    scorePage.score([7, 7, 7]);
    scorePage.score([6, 6, 6]);
    scorePage.score([9, 9, 9]);

    // Half dozen
    scorePage.score([8, 8, 8]);
    scorePage.score([7, 7, 7]);

    scorePage.save();

    historyPage.navigateTo();
    historyPage.selectHistoryItem("Bray I");
    cy.contains("Got it!").click();

    cy.window().then((win) => {
      cy.stub(win, "open").callsFake(() => {
        return win;  // Return the actual window for component mounting
      });
    });

    cy.get("[data-test=\"view-shoot-save\"]").click();
    cy.get("#captain").type("John Smith");
    cy.get("#location").type("Sherwood Forest");
    cy.get("[data-test=\"view-shoot-save2\"]").click();


    cy.get("h1").should("contain", "bray i");
    cy.get("h2").should("contain", "Shot at Sherwood Forest");
    cy.get(".details").should("contain", "recurve");
    cy.get(".signature-row").should("contain", "John Smith");
    cy.get("table").should("contain", "232"); // Updated total for 30 arrows
  });
});