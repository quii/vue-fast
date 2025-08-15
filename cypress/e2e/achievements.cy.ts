import ScorePage from '../pages/scorePage'
import { AchievementsPage } from '../pages/achievementsPage'
import { userDataPage } from '../pages/userDataPage'

describe('Achievements System', () => {
  it('awards and filters the 600 at 720 achievement when archer scores 600+ on WA 70m round', () => {
    const scorePage = new ScorePage()
    const achievementsPage = new AchievementsPage()

    // Setup: disable tips and clear data
    cy.disableAllTips()
    scorePage.visit()
    
    // Set archer details to ensure proper setup
    userDataPage.navigateTo()
    userDataPage.setArcherDetails("male", "recurve", "senior")
    scorePage.navigateTo()
    scorePage.clearData()
    
    // Score 720 points on WA 70m to earn the 600 at 720 achievement
    scorePage.selectGame('WA 70m')
    scorePage.times(72).score(10) // 72 × 10 = 720 points
    scorePage.save()

    // Verify the achievement is earned and displayed correctly
    achievementsPage.visit()
    achievementsPage.shouldShowAchievement('600 at 720')
    achievementsPage.shouldShowAsCompleted('600 at 720')

    // Verify filtering works: achieved filter should show this achievement
    achievementsPage.clickFilter('Achieved')
    achievementsPage.shouldShowFilterAsActive('Achieved')
    achievementsPage.shouldShowAchievement('600 at 720')
    
    // Verify the achieved count shows at least 1 (the achievement we just earned)
    achievementsPage.shouldShowFilterCount('Achieved', '1')
  })
})