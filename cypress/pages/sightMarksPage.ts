class SightMarksPage {
  navigateTo() {
    cy.get("a").contains("Sight").click();
  }

  addSightMark(distance, unit, notches, vertical) {
    cy.contains("Add Mark").click();
    cy.get(".distance-number").clear().type(distance);
    
    // Select unit using radio buttons instead of dropdown
    if (unit === "m" || unit === "meters") {
      cy.get(".radio-option input[value='meters']").click();
    } else if (unit === "yd" || unit === "yards") {
      cy.get(".radio-option input[value='yards']").click();
    }
    
    cy.get(".extension-slider").invoke("val", notches).trigger("input");

    // Set vertical values using component number inputs
    cy.get(".component-inputs .component-number-input").eq(0).invoke("val", vertical.major).trigger("input");
    cy.get(".component-inputs .component-number-input").eq(1).invoke("val", vertical.minor).trigger("input");
    cy.get(".component-inputs .component-number-input").eq(2).invoke("val", vertical.micro).trigger("input");

    cy.get(".primary").click();
  }

  editSightMark(distance, unit, newNotches, newVertical) {
    cy.get(".mark-card").contains(`${distance}${unit}`).click();
    cy.get(".extension-slider").invoke("val", newNotches).trigger("input");

    cy.get(".component-inputs .component-number-input").eq(0).invoke("val", newVertical.major).trigger("input");
    cy.get(".component-inputs .component-number-input").eq(1).invoke("val", newVertical.minor).trigger("input");
    cy.get(".component-inputs .component-number-input").eq(2).invoke("val", newVertical.micro).trigger("input");

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