import ScorePage from "../pages/scorePage";
import { userDataPage } from "../pages/userDataPage";

//todo: F THIS
describe.skip('Participant Scorecard Page', () => {
    const scorePage = new ScorePage();
  
    beforeEach(() => {
    // Clear any existing data and dismiss tutorials
    
    cy.disableAllTips()
    scorePage.visit();
    scorePage.clearData();
    userDataPage.navigateTo();
    userDataPage.setArcherDetails("male", "recurve", "senior");
  })

  it('should navigate to participant scorecard page when clicking on leaderboard entry', () => {
    // Navigate to leaderboard using the nav link
    cy.get('a[href="/leaderboard"]').click()

    // Set user name
    cy.get('input[placeholder="Enter your full name (e.g. John Smith)"]').type('Test User')
    cy.get('button').contains('Continue').click()

    // Create a new shoot
    cy.get('button').contains('Create Live Shoot').click()
        // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000) // Wait for the shoot to be created

    // Should be in the leaderboard view
    cy.url().should('include', '/leaderboard')

    // Add some scores first to have data to view
    cy.get('a[href="/"]').click() // Navigate to scorecard

    // Dismiss any tutorials that might appear on scorecard page
    cy.get('body').then(($body) => {
      if ($body.find('button:contains(\'Got it!\')').length > 0) {
        cy.contains('Got it!').click()
      }
    })

    // Wait for scorecard to load and add some test scores
    scorePage.score([9, 7, 5]);

    // Go back to leaderboard
    cy.get('a[href="/leaderboard"]').click()

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000) // Wait for the shoot to be created

    // Now the user should appear with scores
    cy.contains('Test User').should('be.visible')

    // Click on the participant entry

    cy.get('[data-cy="participant-entry"]').contains('Test User').click()

    // Should navigate to participant scorecard page
    cy.url().should('include', '/participant-scorecard/')
    cy.contains('Test User').should('be.visible')

    // Should have back button
    cy.get('button').contains('Back to Leaderboard').click()

    // Should return to leaderboard
    cy.url().should('include', '/leaderboard')
  })

  it('should show appropriate message when participant has no individual scores', () => {
    // Navigate to leaderboard
    cy.get('a[href="/leaderboard"]').click()

    // Set user name
    cy.get('input[placeholder="Enter your full name (e.g. John Smith)"]').type('No Scores User')
    cy.get('button').contains('Continue').click()

    // Create a new shoot
    cy.get('button').contains('Create Live Shoot').click()

    // Click on the participant entry (who has no scores yet)
    // eslint-disable-next-line cypress/no-unnecessary-waiting
cy.wait(2000) // Wait for the shoot to be created
    cy.get('[data-cy="participant-entry"]').contains('No Scores User').click()

    // Should navigate to scorecard page
    cy.url().should('include', '/participant-scorecard/')
    
    // Should show no scores message
    cy.contains('No Individual Scores Available').should('be.visible')

    // Should have back button
    cy.get('button').contains('Back to Leaderboard').click()
    cy.url().should('include', '/leaderboard')
  })

  it('should handle navigation back to leaderboard correctly', () => {
    cy.get('a[href="/leaderboard"]').click()

    cy.get('input[placeholder="Enter your full name (e.g. John Smith)"]').type('Nav Test User')
    cy.get('button').contains('Continue').click()
    cy.get('button').contains('Create Live Shoot').click()

    // Navigate to scorecard
        // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000) // Wait for the shoot to be created
    cy.get('[data-cy="participant-entry"]').contains('Nav Test User').click()
    cy.url().should('include', '/participant-scorecard/')

    // Use back button
    cy.get('button').contains('Back to Leaderboard').click()
    cy.url().should('include', '/leaderboard')

    // Should still show the leaderboard data
    cy.contains('Nav Test User').should('be.visible')
  })
})
