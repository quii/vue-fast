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
    cy.contains('.badge-title', name).should('exist');
    return this;
  }

  shouldShowDescription(description: string) {
    cy.contains('.badge-description', description).should('exist');
    return this;
  }

  shouldShowCompletionPercentage(achievementName: string, percentage: string) {
    cy.contains('.badge-title', achievementName).closest('.achievement-badge')
      .should('contain', `${percentage}% complete`);
    return this;
  }

  shouldShowArrowProgress(achievementName: string, current: string, target: string) {
    cy.contains('.badge-title', achievementName).closest('.achievement-badge')
      .should('contain', `${current} / ${target} arrows`);
    return this;
  }

  shouldShowScoreProgress(achievementName: string, current: string, target: string, gameType: string) {
    cy.contains('.badge-title', achievementName).closest('.achievement-badge')
      .should('contain', `${current} / ${target} points on ${gameType}`);
    return this;
  }

  shouldShowAsCompleted(achievementName: string) {
    cy.contains('.badge-title', achievementName).closest('.achievement-badge')
      .should('have.class', 'earned');
    return this;
  }

  shouldNotShowAsCompleted(achievementName: string) {
    cy.contains('.badge-title', achievementName).closest('.achievement-badge')
      .should('not.have.class', 'earned');
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
    cy.get('.achievement-badge').should('have.length', count);
    return this;
  }
}

export { AchievementsPage };