describe('API Smoke Test', () => {
  it('should be able to access the API health endpoint', () => {
    // Visit the app first to ensure it's loaded
    cy.visit('/')

    // Then make a request to the API endpoint
    cy.request('/api/health').then((response) => {
      // Verify the response status
      expect(response.status).to.eq(200)

      // Verify the response body contains expected data
      expect(response.body).to.have.property('status', 'ok')
      expect(response.body).to.have.property('message', 'Hello from the backup API!')
    })
  })

})