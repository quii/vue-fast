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
    // First expand all groups to ensure the achievement is visible
    this.expandAllGroups();
    // Then look for the achievement
    cy.contains('.badge-title', name, { timeout: 10000 }).should('exist');
    return this;
  }

  shouldShowDescription(description: string) {
    cy.contains('.badge-description', description).should('exist');
    return this;
  }

  shouldShowCompletionPercentage(achievementName: string, percentage: string) {
    // Ensure all groups are expanded first
    this.expandAllGroups();
    cy.contains('.badge-title', achievementName).closest('.achievement-badge, .compact-achievement-badge')
      .should('contain', `${percentage}% complete`);
    return this;
  }

  shouldShowArrowProgress(achievementName: string, current: string, target: string) {
    // Ensure all groups are expanded first
    this.expandAllGroups();
    cy.contains('.badge-title', achievementName).closest('.achievement-badge, .compact-achievement-badge')
      .should('contain', `${current} / ${target} arrows`);
    return this;
  }

  shouldShowScoreProgress(achievementName: string, current: string, target: string, gameType: string) {
    // Ensure all groups are expanded first
    this.expandAllGroups();
    cy.contains('.badge-title', achievementName).closest('.achievement-badge, .compact-achievement-badge')
      .should('contain', `${current} / ${target} points on ${gameType}`);
    return this;
  }

  shouldShowAsCompleted(achievementName: string) {
    // Ensure all groups are expanded first
    this.expandAllGroups();
    cy.contains('.badge-title', achievementName).closest('.achievement-badge, .compact-achievement-badge')
      .should('have.class', 'earned');
    return this;
  }

  shouldNotShowAsCompleted(achievementName: string) {
    // Ensure all groups are expanded first
    this.expandAllGroups();
    cy.contains('.badge-title', achievementName).closest('.achievement-badge, .compact-achievement-badge')
      .should('not.have.class', 'earned');
    return this;
  }

  private expandAllGroups() {
    // Click each group header to expand all groups
    cy.get('.group-header').each($header => {
      // Check if the group is not expanded and click to expand it
      cy.wrap($header).find('.expand-icon').then($icon => {
        if (!$icon.hasClass('expanded')) {
          cy.wrap($header).click();
        }
      });
    });
    // Wait for expand animations to complete
    cy.wait(500);
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
    // Ensure all groups are expanded first
    this.expandAllGroups();
    cy.get('.achievement-badge, .compact-achievement-badge').should('have.length', count);
    return this;
  }

}

export { AchievementsPage };