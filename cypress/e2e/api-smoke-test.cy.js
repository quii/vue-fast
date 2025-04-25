describe('API Smoke Test', () => {
  it('should be able to access the API health endpoint', () => {
    cy.visit('/')

    cy.request('/api/health').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('status', 'API is running')
    })

    cy.request('/api/diagnose').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('s3Connection', 'success')
    })
  })

})