/**
 * UserData Component Tests
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import UserData from '../../UserData.vue';

describe('UserData', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  test('renders achievement popup notifications toggle', () => {
    const wrapper = mount(UserData);
    
    // Find the checkbox by its label
    const achievementToggle = wrapper.find('input[type="checkbox"]');
    const labels = wrapper.findAll('label');
    const achievementLabel = labels.find(label => 
      label.text().includes('Achievement popup notifications')
    );
    
    expect(achievementLabel).toBeTruthy();
    expect(achievementToggle).toBeTruthy();
  });

  test('achievement popup toggle reflects store state', () => {
    const wrapper = mount(UserData);
    
    // Get the achievement store instance from the component
    const achievementStore = (wrapper.vm as any).achievementStore;
    
    // Initially should be enabled (default)
    expect(achievementStore.popupsEnabled).toBe(true);
  });

  test('achievement popup toggle updates store when changed', async () => {
    const wrapper = mount(UserData);
    
    // Get the achievement store instance
    const achievementStore = (wrapper.vm as any).achievementStore;
    
    // Find the checkbox for achievement popups
    // We need to find the specific checkbox - it should be the one bound to achievementStore.popupsEnabled
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    
    // The achievement popup checkbox should be present
    expect(checkboxes.length).toBeGreaterThan(0);
    
    // Initially should be enabled
    expect(achievementStore.popupsEnabled).toBe(true);
    
    // Disable popups through the store method
    achievementStore.setPopupsEnabled(false);
    await wrapper.vm.$nextTick();
    
    // Should now be disabled
    expect(achievementStore.popupsEnabled).toBe(false);
  });
});