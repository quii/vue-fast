class AchievementsPage {
  visit() {
    cy.visit("/achievements");
    cy.dismissToasters();
  }

  navigateTo() {
    cy.get('[data-cy="nav-achievements"]').click();
    cy.dismissToasters();
  }

  shouldShowAchievement(name: string) {
    cy.contains(name).should('exist');
    return this;
  }

  shouldShowDescription(description: string) {
    cy.contains(description).should('exist');
    return this;
  }

  shouldShowCompletionPercentage(achievementName: string, percentage: string) {
    cy.contains(achievementName).parent().parent()
      .should('contain', `${percentage}% complete`);
    return this;
  }

  shouldShowArrowProgress(achievementName: string, current: string, target: string) {
    cy.contains(achievementName).parent().parent()
      .should('contain', `${current} / ${target} arrows`);
    return this;
  }

  shouldShowScoreProgress(achievementName: string, current: string, target: string, gameType: string) {
    cy.contains(achievementName).parent().parent()
      .should('contain', `${current} / ${target} points on ${gameType}`);
    return this;
  }

  shouldShowAsCompleted(achievementName: string) {
    cy.contains(achievementName).parent().parent()
      .should('have.class', 'completed');
    return this;
  }

  shouldNotShowAsCompleted(achievementName: string) {
    cy.contains(achievementName).parent().parent()
      .should('not.have.class', 'completed');
    return this;
  }

  shouldHaveProgressBars(count: number) {
    cy.get('.progress-bar').should('have.length', count);
    return this;
  }

  shouldShowPercentageIndicators() {
    cy.contains('% complete').should('exist');
    return this;
  }

  clickFilter(filterName: string) {
    cy.contains('.info-display', filterName).click();
    return this;
  }

  shouldShowFilterAsActive(filterName: string) {
    cy.contains('.info-display', filterName).should('have.class', 'active');
    return this;
  }

  shouldShowFilterCount(filterName: string, count: string) {
    cy.contains('.info-display', filterName).find('.info-value').should('contain', count);
    return this;
  }

  shouldHaveAchievementCount(count: number) {
    cy.get('.achievement-card').should('have.length', count);
    return this;
  }
}

export { AchievementsPage };