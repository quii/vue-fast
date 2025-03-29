export class UserDataPage {
  navigateTo() {
    cy.get("a").contains("Profile").click();
  }

  setArcherDetails(gender, bowType, ageGroup, name = null) {
    if (name) {
      // Updated to target BaseInput for name
      cy.get("input[placeholder=\"Name\"]").clear().type(name);
    }

    // Updated to target BaseSelect components in order
    // Age Group is the first BaseSelect
    cy.get("select").eq(0).select(ageGroup);

    // Gender is the second BaseSelect
    cy.get("select").eq(1).select(gender);

    // Bow Type is the third BaseSelect
    cy.get("select").eq(2).select(bowType);
  }

  setClassification(classification) {
    // Get the currently selected bow type
    cy.get("select").eq(2).invoke("val").then(bowType => {
      const capitalizedBowType = bowType.charAt(0).toUpperCase() + bowType.slice(1);

      // Set indoor classification - updated to find by label text
      cy.contains(`${capitalizedBowType} Indoor`)
        .parents(".form-group")  // Navigate to the parent FormGroup
        .find("select")
        .select(classification);

      // Set outdoor classification - updated to find by label text
      cy.contains(`${capitalizedBowType} Outdoor`)
        .parents(".form-group")  // Navigate to the parent FormGroup
        .find("select")
        .select(classification);
    });
  }

  setSeasonDates(indoorDate, outdoorDate) {
    // Updated to target date inputs by their labels
    cy.contains("Indoor Season Start Date")
      .parents(".form-group")
      .find("input[type=\"date\"]")
      .invoke("val", indoorDate)
      .trigger("change");

    cy.contains("Outdoor Season Start Date")
      .parents(".form-group")
      .find("input[type=\"date\"]")
      .invoke("val", outdoorDate)
      .trigger("change");
  }

  resetSeasonDates() {
    // Updated to find the button by its text
    cy.contains("button", "Reset to Default Dates").click();
  }
}

export const userDataPage = new UserDataPage();