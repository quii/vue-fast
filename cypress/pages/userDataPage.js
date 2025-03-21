export class UserDataPage {
  navigateTo() {
    cy.get("a").contains("You").click();
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
      // Capitalize the first letter of the bow type
      const capitalizedBowType = bowType.charAt(0).toUpperCase() + bowType.slice(1);

      // Find the bow type section and set both indoor and outdoor classifications
      cy.contains("h3", capitalizedBowType)
        .parent()
        .within(() => {
          // Set indoor classification
          cy.contains(".classification-row", "Indoor")
            .find("select")
            .select(classification);

          // Set outdoor classification
          cy.contains(".classification-row", "Outdoor")
            .find("select")
            .select(classification);
        });
    });
  }

  checkRoundRecommendation(roundName, shouldExist = true) {
    if (shouldExist) {
      cy.contains(roundName).should("exist");
    } else {
      cy.contains(roundName).should("not.exist");
    }
  }

  setMaxDistance(yards) {
    cy.get("input[type=\"range\"]").invoke("val", yards).trigger("input");
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