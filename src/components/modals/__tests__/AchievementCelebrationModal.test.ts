/**
 * AchievementCelebrationModal Tests
 */

import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AchievementCelebrationModal from '../AchievementCelebrationModal.vue';

describe('AchievementCelebrationModal', () => {
  const createMockAchievement = (id: string, name: string, tier = 'bronze') => ({
    id,
    name,
    description: `Description for ${name}`,
    tier,
    achievedDate: new Date().toISOString()
  });

  const createMockAchievementData = (id: string, name: string, tier = 'bronze') => ({
    id,
    name,
    description: `Description for ${name}`,
    tier,
    progress: {
      isUnlocked: true,
      achievedDate: new Date().toISOString(),
      achievingShootId: 123
    },
    progressPercentage: 100
  });

  test('displays single achievement correctly', () => {
    const achievements = [createMockAchievement('1', 'Test Achievement')];
    
    const wrapper = mount(AchievementCelebrationModal, {
      props: { achievements }
    });

    expect(wrapper.find('.celebration-title').text()).toBe('Achievement Unlocked!');
    expect(wrapper.findAll('.celebration-badge')).toHaveLength(1);
    expect(wrapper.find('.extra-achievements').exists()).toBe(false);
  });

  test('displays multiple achievements with correct title', () => {
    const achievements = [
      createMockAchievement('1', 'First Achievement'),
      createMockAchievement('2', 'Second Achievement')
    ];
    
    const wrapper = mount(AchievementCelebrationModal, {
      props: { achievements }
    });

    expect(wrapper.find('.celebration-title').text()).toBe('2 Achievements Unlocked!');
    expect(wrapper.findAll('.celebration-badge')).toHaveLength(2);
    expect(wrapper.find('.extra-achievements').exists()).toBe(false);
  });

  test('limits display to 4 achievements and shows "plus N more"', () => {
    const achievements = [
      createMockAchievement('1', 'First Achievement'),
      createMockAchievement('2', 'Second Achievement'),
      createMockAchievement('3', 'Third Achievement'),
      createMockAchievement('4', 'Fourth Achievement'),
      createMockAchievement('5', 'Fifth Achievement'),
      createMockAchievement('6', 'Sixth Achievement')
    ];
    
    const wrapper = mount(AchievementCelebrationModal, {
      props: { achievements }
    });

    expect(wrapper.find('.celebration-title').text()).toBe('6 Achievements Unlocked!');
    expect(wrapper.findAll('.celebration-badge')).toHaveLength(4);
    expect(wrapper.find('.extra-achievements').exists()).toBe(true);
    expect(wrapper.find('.extra-achievements-text').text()).toBe('Plus 2 more achievements!');
  });

  test('displays exactly 4 achievements without "plus more" indicator', () => {
    const achievements = [
      createMockAchievement('1', 'First Achievement'),
      createMockAchievement('2', 'Second Achievement'),
      createMockAchievement('3', 'Third Achievement'),
      createMockAchievement('4', 'Fourth Achievement')
    ];
    
    const wrapper = mount(AchievementCelebrationModal, {
      props: { achievements }
    });

    expect(wrapper.find('.celebration-title').text()).toBe('4 Achievements Unlocked!');
    expect(wrapper.findAll('.celebration-badge')).toHaveLength(4);
    expect(wrapper.find('.extra-achievements').exists()).toBe(false);
  });

  test('handles singular text for "plus 1 more"', () => {
    const achievements = [
      createMockAchievement('1', 'First Achievement'),
      createMockAchievement('2', 'Second Achievement'),
      createMockAchievement('3', 'Third Achievement'),
      createMockAchievement('4', 'Fourth Achievement'),
      createMockAchievement('5', 'Fifth Achievement')
    ];
    
    const wrapper = mount(AchievementCelebrationModal, {
      props: { achievements }
    });

    expect(wrapper.find('.celebration-title').text()).toBe('5 Achievements Unlocked!');
    expect(wrapper.findAll('.celebration-badge')).toHaveLength(4);
    expect(wrapper.find('.extra-achievements').exists()).toBe(true);
    expect(wrapper.find('.extra-achievements-text').text()).toBe('Plus 1 more achievement!');
  });

  test('emits dismiss event when button clicked', async () => {
    const achievements = [createMockAchievement('1', 'Test Achievement')];
    
    const wrapper = mount(AchievementCelebrationModal, {
      props: { achievements }
    });

    await wrapper.find('.dismiss-btn').trigger('click');
    
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
  });

  test('emits disable-popups event when settings link clicked', async () => {
    const achievements = [createMockAchievement('1', 'Test Achievement')];
    
    const wrapper = mount(AchievementCelebrationModal, {
      props: { achievements }
    });

    await wrapper.find('.settings-link').trigger('click');
    
    expect(wrapper.emitted('disable-popups')).toHaveLength(1);
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
  });

  test('handles AchievementData objects correctly', () => {
    const achievements = [
      createMockAchievementData('1', 'First Achievement'),
      createMockAchievementData('2', 'Second Achievement')
    ];
    
    const wrapper = mount(AchievementCelebrationModal, {
      props: { achievements }
    });

    expect(wrapper.find('.celebration-title').text()).toBe('2 Achievements Unlocked!');
    expect(wrapper.findAll('.celebration-badge')).toHaveLength(2);
    expect(wrapper.find('.extra-achievements').exists()).toBe(false);
  });
});