export class UserDataPage {
  navigateTo() {
    cy.get("a").contains("Profile").click();
  }

  setArcherDetails(gender, bowType, ageGroup, name = null) {
    if (name) {
      cy.get("input[type='text']").type(name);
    }
    cy.get("select").eq(0).select(ageGroup);
    cy.get("select").eq(1).select(gender);
    cy.get("select").eq(2).select(bowType);
  }

  setClassification(classification) {
    // Get the currently selected bow type
    cy.get("select").eq(2).invoke("val").then(bowType => {
      const capitalizedBowType = bowType.charAt(0).toUpperCase() + bowType.slice(1);

      // Set indoor classification
      cy.contains(`${capitalizedBowType} Indoor`)
        .find("select")
        .select(classification);

      // Set outdoor classification
      cy.contains(`${capitalizedBowType} Outdoor`)
        .find("select")
        .select(classification);
    });
  }

  setSeasonDates(indoorDate, outdoorDate) {
    cy.get("input[type=\"date\"]").eq(0).invoke("val", indoorDate).trigger("change");
    cy.get("input[type=\"date\"]").eq(1).invoke("val", outdoorDate).trigger("change");
  }

  resetSeasonDates() {
    cy.contains("button", "Reset to Default Dates").click();
  }
}

export const userDataPage = new UserDataPage();