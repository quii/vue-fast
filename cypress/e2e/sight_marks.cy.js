import SightMarksPage from "../pages/sightMarksPage";

describe("Sight Marks", () => {
  const sightMarksPage = new SightMarksPage();

  beforeEach(() => {
    cy.visit("/");
    sightMarksPage.navigateTo();
  });

  it("manages sight marks", () => {
    // Add new sight mark
    sightMarksPage.addSightMark(20, "m", 5);
    sightMarksPage.checkSightMarkExists(20, "m", 5);

    // Edit sight mark
    sightMarksPage.editSightMark(20, "m", 8);
    sightMarksPage.checkSightMarkExists(20, "m", 8);

    // Delete sight mark
    sightMarksPage.deleteSightMark(20, "m");
    sightMarksPage.checkSightMarkNotExists(20, "m");
  });
});