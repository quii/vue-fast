class DataManagementPage {
  navigateTo() {
    cy.visit("/");
    cy.get("a").contains("Data").click();
  }

  visit() {
    cy.get('a').contains('Data').click()
  }

  resetData() {
    cy.get("button").contains("Reset").click();
    cy.disableAllTips()
  }

  importData(fixturePath) {
    cy.get("[data-test=\"file-upload\"]").selectFile(fixturePath);
  }

  // New methods for cloud backup functionality
  testConnection() {
    cy.contains('Test Connection').click()
  }

  manualBackup() {
    cy.contains('Backup Now').click()
    // Wait for the backup to complete
    cy.contains('Backup successful', { timeout: 10000 }).should('be.visible')
  }

  getBackupsList() {
    return cy.get('.backup-card')
  }

  getFirstBackupTimestamp() {
    return cy.get('.backup-card .backup-date').first().invoke('text')
  }

  restoreFromFirstBackup() {
    // First scroll to the backup section to ensure it's in view
    cy.contains('Available Backups').scrollIntoView()

    // Then find the first backup item and click its restore button
    cy.get('.backup-card').last().scrollIntoView().within(() => {
      cy.contains('Restore').click({ force: true })
    })

    // Confirm the restore dialog
    cy.on('window:confirm', () => true)

    // Wait for the restore to complete
    cy.contains('Restore successful', { timeout: 10000 }).should('be.visible')
  }

  waitForBackupsToLoad() {
    cy.wait(1000) // Wait for the score to be saved
    // Wait for the "Loading backups..." message to disappear
    cy.contains('Loading backups...', { timeout: 10000 }).should('not.exist')

    // Scroll to the cloud backup section to ensure it's in view
    cy.contains('Cloud Backup').scrollIntoView()

    // Either we have backups or a "No backups found" message
    cy.get('body').then(($body) => {
      if ($body.find('.backup-card').length === 0) {
        cy.contains('No backups found').should('be.visible')
      } else {
        cy.get('.backup-card').should('be.visible')
      }
    })
  }
}

export default DataManagementPage;
