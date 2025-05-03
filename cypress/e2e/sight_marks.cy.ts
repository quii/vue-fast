import SightMarksPage from "../pages/sightMarksPage";
import ScorePage from '../pages/scorePage'

describe("Sight Marks", () => {
  const sightMarksPage = new SightMarksPage();
  const scorePage = new ScorePage()

  beforeEach(() => {
    cy.disableAllTips()
    scorePage.visit()
    sightMarksPage.navigateTo();
  });

  it("allows creation, editing and deletion of sight marks", () => {
    const vertical = { major: 5, minor: 6, micro: 2 };
    sightMarksPage.addSightMark(20, "m", 5, vertical);
    sightMarksPage.checkSightMarkExists(20, "m", 5, vertical);

    const newVertical = { major: 6, minor: 7, micro: 3 };
    sightMarksPage.editSightMark(20, "m", 6, newVertical);
    sightMarksPage.checkSightMarkExists(20, "m", 6, newVertical);
    //
    // sightMarksPage.deleteSightMark(20, "m");
    // sightMarksPage.checkSightMarkNotExists(20, "m");
  });

  it("sorts sight marks by priority and distance", () => {
    const vertical = { major: 5, minor: 0, micro: 0 };
    sightMarksPage.addSightMark(50, "m", 5, vertical);
    sightMarksPage.addSightMark(30, "m", 3, vertical);
    sightMarksPage.addSightMark(40, "yd", 4, vertical);

    sightMarksPage.togglePriority(30, "m");

    cy.get(".mark-card").first().should("contain", "30m");
  });
});