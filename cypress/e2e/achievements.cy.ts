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
    scorePage.times(72).score(10) // 72 × 10 = 720 points
    scorePage.save()

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
})