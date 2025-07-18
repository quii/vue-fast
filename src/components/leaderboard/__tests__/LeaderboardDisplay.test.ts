import { describe, test, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import LeaderboardDisplay from '../LeaderboardDisplay.vue';
import type { Shoot, ShootParticipant } from '../../../../shared/models/Shoot';

// Mock the user store
vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    user: {
      name: 'Test User'
    }
  })
}));

const createParticipant = (
  id: string,
  archerName: string,
  roundName: string,
  scores: (number | string)[] = [],
  totalScore: number = 0
): ShootParticipant => ({
  id,
  archerName,
  roundName,
  totalScore,
  arrowsShot: scores.length,
  finished: false,
  scores,
  lastUpdated: new Date(),
});

const createShoot = (participants: ShootParticipant[]): Shoot => ({
  id: 'test-shoot',
  code: '1234',
  creatorName: 'Test Creator',
  createdAt: new Date(),
  expiresAt: new Date(),
  participants,
  lastUpdated: new Date(),
});

describe('LeaderboardDisplay', () => {
  test('displays best end when grouped by round and complete ends exist', () => {
    const participants = [
      createParticipant('1', 'Alice', 'WA 70m', [10, 10, 9, 9, 8, 8], 54),
      createParticipant('2', 'Bob', 'WA 70m', [10, 10, 10, 9, 9, 9], 57), // Best end
    ];
    const shoot = createShoot(participants);

    const wrapper = mount(LeaderboardDisplay, {
      props: {
        shoot,
        groupByRound: true
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          ParticipantList: {
            template: '<div data-test="participant-list">{{ $props.bestEnds && $props.bestEnds.length > 0 ? "Has best ends" : "No best ends" }}</div>',
            props: ['participants', 'title', 'bestEnds']
          }
        }
      }
    });

    const participantList = wrapper.find('[data-test="participant-list"]');
    expect(participantList.exists()).toBe(true);
    expect(participantList.text()).toBe('Has best ends');
  });

  test('does not display best end when not grouped by round', () => {
    const participants = [
      createParticipant('1', 'Alice', 'WA 70m', [10, 10, 9, 9, 8, 8], 54),
    ];
    const shoot = createShoot(participants);

    const wrapper = mount(LeaderboardDisplay, {
      props: {
        shoot,
        groupByRound: false
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          ParticipantList: {
            template: '<div data-test="participant-list">{{ $props.bestEnds && $props.bestEnds.length > 0 ? "Has best ends" : "No best ends" }}</div>',
            props: ['participants', 'title', 'bestEnds']
          }
        }
      }
    });

    const participantList = wrapper.find('[data-test="participant-list"]');
    expect(participantList.exists()).toBe(true);
    expect(participantList.text()).toBe('No best ends');
  });

  test('does not display best end when no complete ends exist', () => {
    const participants = [
      createParticipant('1', 'Alice', 'WA 70m', [10, 9, 8]), // Only 3 arrows for a 6-arrow end
    ];
    const shoot = createShoot(participants);

    const wrapper = mount(LeaderboardDisplay, {
      props: {
        shoot,
        groupByRound: true
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          ParticipantList: {
            template: '<div data-test="participant-list">{{ $props.bestEnds && $props.bestEnds.length > 0 ? "Has best ends" : "No best ends" }}</div>',
            props: ['participants', 'title', 'bestEnds']
          }
        }
      }
    });

    const participantList = wrapper.find('[data-test="participant-list"]');
    expect(participantList.exists()).toBe(true);
    expect(participantList.text()).toBe('No best ends');
  });
});
