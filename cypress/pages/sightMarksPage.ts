class SightMarksPage {
  navigateTo() {
    cy.get("a").contains("Sight").click();
  }

  addSightMark(distance, unit, notches, vertical) {
    cy.contains("Add Mark").click();
    cy.get(".distance-number").clear().type(distance);
    cy.get(".unit-select").select(unit);
    cy.get(".horizontal-slider").invoke("val", 15 - notches).trigger("input");

    // Set vertical values using number spinners
    cy.get(".vertical-inputs .number-spinner").eq(0).invoke("val", vertical.major).trigger("input");
    cy.get(".vertical-inputs .number-spinner").eq(1).invoke("val", vertical.minor).trigger("input");
    cy.get(".vertical-inputs .number-spinner").eq(2).invoke("val", vertical.micro).trigger("input");

    cy.get(".primary").click();
  }

  editSightMark(distance, unit, newNotches, newVertical) {
    cy.get(".mark-card").contains(`${distance}${unit}`).click();
    cy.get(".horizontal-slider").invoke("val", 15 - newNotches).trigger("input");

    cy.get(".vertical-inputs .spinner-input").eq(0).invoke("val", newVertical.major).trigger("input");
    cy.get(".vertical-inputs .spinner-input").eq(1).invoke("val", newVertical.minor).trigger("input");
    cy.get(".vertical-inputs .spinner-input").eq(2).invoke("val", newVertical.micro).trigger("input");

    cy.get(".primary").click();
  }

  deleteSightMark(distance, unit) {
    cy.get(".mark-card").contains(`${distance}${unit}`)
      .trigger("touchstart")
      .wait(500);
    cy.contains("button", "Delete").click();
  }

  checkSightMarkExists(distance, unit, notches, vertical) {
    // First check that a mark card with the distance/unit exists
    cy.get(".mark-card").should("contain", `${distance}${unit}`);

    // Then check for the extension value within the definition list
    cy.get(".mark-card").contains(`${distance}${unit}`)
      .parents(".mark-card")
      .find("dt").contains("Extension")
      .siblings("dd").should("contain", `${notches} notches`);

    // And check for the height value within the definition list
    cy.get(".mark-card").contains(`${distance}${unit}`)
      .parents(".mark-card")
      .find("dt").contains("Height")
      .siblings("dd").should("contain", `${vertical.major}.${vertical.minor}.${vertical.micro}`);
  }

  checkSightMarkNotExists(distance, unit) {
    cy.contains(`.mark-card`, `${distance}${unit}`).should("not.exist");
  }

  togglePriority(distance, unit) {
    cy.get(".mark-card")
      .contains(`${distance}${unit}`)
      .parents(".mark-card")
      .find(".star-button")
      .click();
  }
}
export default SightMarksPage;