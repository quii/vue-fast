import ScorePage from '../pages/scorePage'
import { AchievementsPage } from '../pages/achievementsPage'
import { userDataPage } from '../pages/userDataPage'

describe('Achievements System', () => {
  it('awards and filters the 720 mastery diamond achievement when archer scores 600+ on WA 70m round with recurve', () => {
    const scorePage = new ScorePage()
    const achievementsPage = new AchievementsPage()

    // Setup: disable tips and clear data
    // @ts-ignore - Custom command defined in commands.ts
    cy.disableAllTips()
    scorePage.visit()
    
    // Set archer details to ensure proper setup (recurve bow type is required)
    userDataPage.navigateTo()
    userDataPage.setArcherDetails("male", "recurve", "senior")
    scorePage.navigateTo()
    scorePage.clearData()
    
    // Score 720 points on WA 70m to earn the 720 Mastery Diamond achievement
    scorePage.selectGame('WA 70m')
    // Score 72 arrows of 10 to get 720 points
    const perfectArrows = Array(72).fill(10)
    scorePage.score(perfectArrows)

    scorePage.save().then(() => {
      // Should end up on history page
      scorePage.shouldHaveNavigatedToHistory()
    })

    // Verify the achievement is earned and displayed correctly
    achievementsPage.visit()
    achievementsPage.shouldShowAchievement('600 @ 720 (Recurve)')
    achievementsPage.shouldShowAsCompleted('600 @ 720 (Recurve)')

    // Verify filtering works: achieved filter should show this achievement
    achievementsPage.clickFilter('Achieved')
    achievementsPage.shouldShowFilterAsActive('Achieved')
    achievementsPage.shouldShowAchievement('600 @ 720 (Recurve)')
    
    achievementsPage.shouldShowFilterCount('Achieved', '4')
  })
  
  it('celebrates achievement with proper UX flow - modal appears, dismisses, then navigates', () => {
    const scorePage = new ScorePage()

    // Setup: disable tips and clear data
    // @ts-ignore - Custom command defined in commands.ts
    cy.disableAllTips()
    scorePage.visit()
    
    // Set archer details to ensure proper setup
    userDataPage.navigateTo()
    userDataPage.setArcherDetails("male", "recurve", "senior")
    scorePage.navigateTo()
    scorePage.clearData()
    
    // Score enough to trigger achievements (first shoot should trigger multiple achievements)
    scorePage.selectGame('National 40')
    const testArrows = Array(72).fill(9) // Use good scores to ensure achievements trigger
    scorePage.score(testArrows)

    // Save and test that achievement popup appears
    scorePage.saveAndWaitForAchievements()
      .waitForAchievementCelebration()
      .shouldShowAchievementTitle()
    
    // Dismiss the achievement popup
    cy.get('button').contains('Awesome!').click()
    
    // Should navigate to history after achievements are dismissed
    scorePage.shouldHaveNavigatedToHistory()
  })
})