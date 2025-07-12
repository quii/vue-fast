import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ArcherDetails from '../ArcherDetails.vue';

describe('ArcherDetails', () => {
  test('displays basic archer information', () => {
    const wrapper = mount(ArcherDetails, {
      props: {
        name: 'John Doe',
        ageGroup: 'senior',
        gender: 'male',
        bowType: 'recurve',
        status: 'Practice'
      }
    });

    expect(wrapper.text()).toContain('John Doe');
    expect(wrapper.text()).toContain('Senior');
    expect(wrapper.text()).toContain('Male');
    expect(wrapper.text()).toContain('Recurve');
    expect(wrapper.text()).toContain('Practice');
  });

  test('displays location when provided', () => {
    const wrapper = mount(ArcherDetails, {
      props: {
        name: 'John Doe',
        location: {
          latitude: 51.5074,
          longitude: -0.1278,
          placeName: 'London Archery Club',
          timestamp: Date.now()
        }
      }
    });

    expect(wrapper.text()).toContain('📍 London Archery Club');
    expect(wrapper.find('.location-chip').exists()).toBe(true);
  });

  test('does not display location when not provided', () => {
    const wrapper = mount(ArcherDetails, {
      props: {
        name: 'John Doe'
      }
    });

    expect(wrapper.text()).not.toContain('📍');
    expect(wrapper.find('.location-chip').exists()).toBe(false);
  });

  test('does not display location when location has no place name', () => {
    const wrapper = mount(ArcherDetails, {
      props: {
        name: 'John Doe',
        location: {
          latitude: 51.5074,
          longitude: -0.1278,
          timestamp: Date.now()
        }
      }
    });

    expect(wrapper.text()).not.toContain('📍');
    expect(wrapper.find('.location-chip').exists()).toBe(false);
  });

  test('displays handicap when provided', () => {
    const wrapper = mount(ArcherDetails, {
      props: {
        name: 'John Doe',
        handicap: 42
      }
    });

    expect(wrapper.text()).toContain('Handicap: 42');
  });

  test('displays classification when provided', () => {
    const wrapper = mount(ArcherDetails, {
      props: {
        name: 'John Doe',
        classification: {
          name: 'B1',
          scheme: 'AGB'
        }
      }
    });

    expect(wrapper.text()).toContain('B1 (AGB)');
  });
});
