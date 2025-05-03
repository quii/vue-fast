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
    scorePage.visit()
    userDataPage.navigateTo();
    userDataPage.setArcherDetails('male', 'recurve', 'senior', 'Test Archer 1')

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

    cy.window().then((win) => {
      cy.stub(win, "open").callsFake(() => {
        return win;  // Return the actual window for component mounting
      });
    });

    cy.contains('Share').click()

    // Update for the new location field
    cy.get("#location").type("Sherwood Forest");

    // Click the Download PDF button
    cy.get("[data-test=\"view-shoot-save2\"]").click();

    // Now the captain input modal should appear - fill it in
    cy.get('#captain').type('John Smith')

    // Find and click the Download PDF button in the captain modal
    cy.get('[data-test="captain-submit-button"]').click()

    cy.get("h1").should("contain", "bray i");
    cy.get("h2").should("contain", "Shot at Sherwood Forest");
    cy.get(".archer-details").should("contain", "Recurve");
    cy.get(".signature-row").should("contain", "John Smith");
    cy.get("table").should("contain", "231"); // Updated total for 30 arrows
  });
});