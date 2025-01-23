export class UserDataPage {
  navigateTo() {
    cy.get("a").contains("You").click();
  }

  setArcherDetails(gender, bowType, ageGroup) {
    cy.get("select").eq(0).select(ageGroup);
    cy.get("select").eq(1).select(gender);
    cy.get("select").eq(2).select(bowType);
    cy.get("button").contains("Save").click();
  }
}

export const userDataPage = new UserDataPage();
