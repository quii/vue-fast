import ScorePage from '../pages/scorePage'
import { userDataPage } from '../pages/userDataPage'
import HistoryPage from '../pages/historyPage'
import DataManagementPage from '../pages/dataManagementPage'

describe('Cloud Backup and Restore', () => {
  const scorePage = new ScorePage()
  const historyPage = new HistoryPage()
  const dataManagementPage = new DataManagementPage()

  // Use a unique identifier for each test run to avoid conflicts
  const testId = Date.now().toString()
  const archerName = `Test Archer ${testId}`

  beforeEach(() => {
    // Start with a clean slate
    cy.disableAllTips()
    scorePage.visit()
    dataManagementPage.navigateTo()
    dataManagementPage.resetData()
    cy.disableAllTips()

    userDataPage.navigateTo()
    userDataPage.setArcherDetails('male', 'recurve', 'senior', archerName)
  })

  it('should backup and restore data correctly', () => {
    // First shoot - Score a Bray I round
    scorePage.navigateTo()
    scorePage.selectGame('Bray i')

    // First dozen
    scorePage.score([9, 8, 7])
    scorePage.score([8, 8, 8])
    scorePage.score([7, 7, 7])
    scorePage.score([9, 9, 9])

    // Second dozen
    scorePage.score([8, 8, 8])
    scorePage.score([7, 7, 7])
    scorePage.score([6, 6, 6])
    scorePage.score([9, 9, 9])

    // Half dozen
    scorePage.score([8, 8, 8])
    scorePage.score([7, 7, 7])

    // Save the score
    scorePage.save()

    // Verify the score is in history
    historyPage.navigateTo()
    historyPage.checkScoreExists('231', 'Bray I')

    // Create a backup
    dataManagementPage.visit()
    dataManagementPage.waitForBackupsToLoad()
    // dataManagementPage.manualBackup()

    // Store the timestamp of the first backup for later verification
    let firstBackupTimestamp
    dataManagementPage.getFirstBackupTimestamp().then((timestamp) => {
      firstBackupTimestamp = timestamp
    })

    // Second shoot - Score another Bray I round with different scores
    scorePage.navigateTo()
    scorePage.selectGame('Bray i')

    // First dozen
    scorePage.score([9, 8, 7])
    scorePage.score([8, 8, 8])
    scorePage.score([7, 7, 7])
    scorePage.score([9, 9, 9])

    // Second dozen
    scorePage.score([8, 8, 8])
    scorePage.score([7, 7, 7])
    scorePage.score([6, 6, 6])
    scorePage.score([9, 9, 9])

    // Half dozen
    scorePage.score([8, 8, 8])
    scorePage.score([7, 7, 6])

    // Save the second score
    scorePage.save()

    // Verify both scores are in history
    historyPage.navigateTo()
    historyPage.checkScoreExists('231', 'Bray I') // First score
    historyPage.checkScoreExists('230', 'Bray I') // Second score

    // Restore from the first backup
    dataManagementPage.visit()
    dataManagementPage.waitForBackupsToLoad()

    // Verify we have at least two backups
    dataManagementPage.getBackupsList().should('have.length.at.least', 2)

    // Restore from the first backup (which should contain only the first shoot)
    dataManagementPage.restoreFromFirstBackup()

    // Verify only the first score is in history after restore
    historyPage.navigateTo()
    historyPage.checkScoreExists('231', 'Bray I') // First score should still exist

    // The second score should not exist anymore
    cy.get('body').then(($body) => {
      const hasSecondScore = $body.text().includes('230')
      expect(hasSecondScore).to.be.false
    })
  })
})