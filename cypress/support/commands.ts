// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/**
 * This command scores a number.
 * @name score
 * @function
 * @param {number} number - The number to score.
 * @memberof Cypress.Chainable#
 */
Cypress.Commands.add("score", (number) => {
  cy.get("button").contains(number.toString()).click();
});

Cypress.Commands.overwrite("visit", (originalFn, url, options) => {
  const newOptions = Object.assign({}, options, {
    onBeforeLoad: (win) => {
      delete win.navigator.__proto__.serviceWorker;
      if (options && options.onBeforeLoad) {
        options.onBeforeLoad(win);
      }
    }
  });

  return originalFn(url, newOptions);
});

// Add this to your commands.js file

// Command to dismiss any visible toasters
Cypress.Commands.add("dismissToasters", () => {
  // Check if any toasters are visible
  cy.get("body").then($body => {
    if ($body.find(".Vue-Toastification__toast").length > 0) {
      // Click on each toaster's close button if it exists
      cy.get(".Vue-Toastification__toast").each($toast => {
        cy.wrap($toast).find(".Vue-Toastification__close-button").click({ force: true });
      });

      // If there's no close button, wait for them to disappear
      cy.get(".Vue-Toastification__toast").should("not.exist", { timeout: 10000 });
    }
  });
});

// Command to wait for any action that might trigger a toaster
Cypress.Commands.add("safeClick", { prevSubject: true }, (subject, options) => {
  // First dismiss any existing toasters
  cy.dismissToasters();

  // Then perform the click
  cy.wrap(subject).click(options);

  // Then dismiss any new toasters that might appear
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500); // Short wait for toaster to appear
  cy.dismissToasters();
});
