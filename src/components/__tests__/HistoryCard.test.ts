import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import HistoryCard from '../HistoryCard.vue';

describe('HistoryCard', () => {
  test('displays basic history item information', () => {
    const mockItem = {
      id: 1,
      gameType: 'National',
      date: '2023-01-01',
      score: 456,
      averagePerEnd: 25.3
    };

    const wrapper = mount(HistoryCard, {
      props: { item: mockItem }
    });

    expect(wrapper.text()).toContain('National');
    expect(wrapper.text()).toContain('456');
    expect(wrapper.text()).toContain('25.3 / end');
  });

  test('displays location on separate row when available', () => {
    const mockItem = {
      id: 1,
      gameType: 'National',
      date: '2023-01-01',
      score: 456,
      location: {
        latitude: 51.5074,
        longitude: -0.1278,
        placeName: 'Westminster Archery Club, London',
        timestamp: Date.now()
      }
    };

    const wrapper = mount(HistoryCard, {
      props: { item: mockItem }
    });

    expect(wrapper.text()).toContain('Westminster Archery Club, London');
    expect(wrapper.find('.location-row').exists()).toBe(true);
    expect(wrapper.find('.location-name').exists()).toBe(true);
  });

  test('does not display location row when location is not available', () => {
    const mockItem = {
      id: 1,
      gameType: 'National',
      date: '2023-01-01',
      score: 456
    };

    const wrapper = mount(HistoryCard, {
      props: { item: mockItem }
    });

    expect(wrapper.find('.location-row').exists()).toBe(false);
    expect(wrapper.find('.location-name').exists()).toBe(false);
  });

  test('does not display location row when location has no place name', () => {
    const mockItem = {
      id: 1,
      gameType: 'National',
      date: '2023-01-01',
      score: 456,
      location: {
        latitude: 51.5074,
        longitude: -0.1278,
        timestamp: Date.now()
      }
    };

    const wrapper = mount(HistoryCard, {
      props: { item: mockItem }
    });

    expect(wrapper.find('.location-row').exists()).toBe(false);
  });

  test('displays shoot duration when available', () => {
    const mockItem = {
      id: 1,
      gameType: 'National',
      date: '2023-01-01',
      score: 456,
      shootDuration: 45 * 60 * 1000 // 45 minutes in milliseconds
    };

    const wrapper = mount(HistoryCard, {
      props: { item: mockItem }
    });

    expect(wrapper.text()).toContain('45m');
    expect(wrapper.find('.shoot-duration').exists()).toBe(true);
  });

  test('does not display duration when not available', () => {
    const mockItem = {
      id: 1,
      gameType: 'National',
      date: '2023-01-01',
      score: 456
    };

    const wrapper = mount(HistoryCard, {
      props: { item: mockItem }
    });

    expect(wrapper.find('.shoot-duration').exists()).toBe(false);
  });

  test('displays duration with hours and minutes', () => {
    const mockItem = {
      id: 1,
      gameType: 'National',
      date: '2023-01-01',
      score: 456,
      shootDuration: 90 * 60 * 1000 // 1 hour 30 minutes in milliseconds
    };

    const wrapper = mount(HistoryCard, {
      props: { item: mockItem }
    });

    expect(wrapper.text()).toContain('1h 30m');
  });

  test('displays classification when available', () => {
    const mockItem = {
      id: 1,
      gameType: 'National',
      date: '2023-01-01',
      score: 456,
      classification: {
        name: 'B1',
        scheme: 'AGB'
      }
    };

    const wrapper = mount(HistoryCard, {
      props: { item: mockItem }
    });

    // The classification appears as an indicator in the DeleteableCard
    expect(wrapper.find('[data-test="score"]').exists()).toBe(true);
  });
});
