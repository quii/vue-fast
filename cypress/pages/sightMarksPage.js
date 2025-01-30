class SightMarksPage {
  navigateTo() {
    cy.get("a").contains("📐").click();
  }

  addSightMark(distance, unit, notches) {
    cy.get(".add-button").click();
    cy.get(".distance-number").type(distance);
    cy.get(".unit-select").select(unit);
    cy.get(".horizontal-slider").invoke("val", 15 - notches).trigger("input");
    cy.get(".primary").click();
  }

  editSightMark(distance, unit, newNotches) {
    cy.get(".mark-card").contains(`${distance}${unit}`).click();
    cy.get(".horizontal-slider").invoke("val", 15 - newNotches).trigger("input");
    cy.get(".primary").click();
  }

  deleteSightMark(distance, unit) {
    cy.get(".mark-card").contains(`${distance}${unit}`)
      .trigger("touchstart")
      .wait(500);
    cy.contains("button", "Delete").click();
  }

  checkSightMarkExists(distance, unit, notches) {
    cy.get(".mark-card").should("contain", `${distance}${unit}`);
    cy.get(".mark-card").should("contain", `Extension: ${notches} notches`);
  }

  checkSightMarkNotExists(distance, unit) {
    cy.contains(`.mark-card`, `${distance}${unit}`).should("not.exist");
  }
}

export default SightMarksPage;