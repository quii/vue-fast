import { describe, expect, it, beforeEach, afterAll } from 'vitest';
import { Shoot, ShootParticipant } from '../../models/Shoot.js';
import { ShootRepository } from '../../ports/ShootRepository.js';

/**
 * Contract test for any implementation of ShootRepository
 * @param createRepository A function that creates a fresh repository for each test
 * @param cleanupRepository A function that cleans up the repository after tests
 */
export function ShootRepositoryContract(
  name: string,
  createRepository: () => Promise<ShootRepository>,
  cleanupRepository?: () => Promise<void>
) {
  describe(`ShootRepository Contract: ${name}`, () => {
    let repository: ShootRepository;

    beforeEach(async () => {
      repository = await createRepository();
    });

    afterAll(async () => {
      if (cleanupRepository) {
        await cleanupRepository();
      }
    });

    it('saves and retrieves a shoot', async () => {
      // Create a test shoot
      const shoot: Shoot = createTestShoot('1234', 'Test Archer');

      // Save it
      await repository.saveShoot(shoot);

      // Retrieve it
      const retrieved = await repository.getShootByCode('1234');

      // Verify it matches what we saved
      expect(retrieved).not.toBeNull();
      expect(retrieved?.code).toBe('1234');
      expect(retrieved?.creatorName).toBe('Test Archer');
      expect(retrieved?.participants).toHaveLength(0);

      // Verify dates are properly serialized/deserialized
      expect(retrieved?.createdAt instanceof Date).toBe(true);
      expect(retrieved?.expiresAt instanceof Date).toBe(true);
      expect(retrieved?.lastUpdated instanceof Date).toBe(true);
    });

    it('returns null for non-existent shoots', async () => {
      const shoot = await repository.getShootByCode('non-existent');
      expect(shoot).toBeNull();
    });

    it('updates an existing shoot', async () => {
      // Create and save a test shoot
      const shoot = createTestShoot('1234', 'Test Archer');
      await repository.saveShoot(shoot);

      // Modify it
      shoot.participants.push({
        id: 'participant_1',
        archerName: 'New Archer',
        roundName: 'Windsor',
        totalScore: 42,
        lastUpdated: new Date(),
        currentPosition: 1
      });
      shoot.lastUpdated = new Date();

      // Save the updated version
      await repository.saveShoot(shoot);

      // Retrieve it
      const retrieved = await repository.getShootByCode('1234');

      // Verify it has the updates
      expect(retrieved?.participants).toHaveLength(1);
      expect(retrieved?.participants[0].archerName).toBe('New Archer');
      expect(retrieved?.participants[0].totalScore).toBe(42);
    });

    it('deletes a shoot', async () => {
      // Create and save a test shoot
      const shoot = createTestShoot('1234', 'Test Archer');
      await repository.saveShoot(shoot);

      // Verify it exists
      expect(await repository.getShootByCode('1234')).not.toBeNull();

      // Delete it
      await repository.deleteShoot('1234');

      // Verify it's gone
      expect(await repository.getShootByCode('1234')).toBeNull();
    });

    it('checks if a code exists', async () => {
      // Create and save a test shoot
      const shoot = createTestShoot('1234', 'Test Archer');
      await repository.saveShoot(shoot);

      // Check existence
      expect(await repository.codeExists('1234')).toBe(true);
      expect(await repository.codeExists('5678')).toBe(false);
    });

    it('handles expired shoots', async () => {
      // Create a shoot that's already expired
      const shoot = createTestShoot('1234', 'Test Archer');
      shoot.expiresAt = new Date(Date.now() - 1000); // 1 second in the past

      // Save it
      await repository.saveShoot(shoot);

      // Attempt to retrieve it - should return null since it's expired
      const retrieved = await repository.getShootByCode('1234');
      expect(retrieved).toBeNull();
    });

    it('handles complex participant data', async () => {
      // Create a shoot with multiple participants
      const shoot = createTestShoot('1234', 'Test Archer');

      // Add participants with various scores and positions
      const participants: ShootParticipant[] = [
        {
          id: 'p1',
          archerName: 'Archer 1',
          roundName: 'Windsor',
          totalScore: 30,
          lastUpdated: new Date(),
          currentPosition: 3,
          previousPosition: 2
        },
        {
          id: 'p2',
          archerName: 'Archer 2',
          roundName: 'National',
          totalScore: 50,
          lastUpdated: new Date(),
          currentPosition: 1
        },
        {
          id: 'p3',
          archerName: 'Archer 3',
          roundName: 'Windsor',
          totalScore: 40,
          lastUpdated: new Date(),
          currentPosition: 2,
          previousPosition: 3
        }
      ];

      shoot.participants = participants;

      // Save it
      await repository.saveShoot(shoot);

      // Retrieve it
      const retrieved = await repository.getShootByCode('1234');

      // Verify participants data is preserved
      expect(retrieved?.participants).toHaveLength(3);

      // Check each participant
      const archer1 = retrieved?.participants.find(p => p.archerName === 'Archer 1');
      const archer2 = retrieved?.participants.find(p => p.archerName === 'Archer 2');
      const archer3 = retrieved?.participants.find(p => p.archerName === 'Archer 3');

      expect(archer1?.totalScore).toBe(30);
      expect(archer1?.currentPosition).toBe(3);
      expect(archer1?.previousPosition).toBe(2);

      expect(archer2?.totalScore).toBe(50);
      expect(archer2?.currentPosition).toBe(1);
      expect(archer2?.previousPosition).toBeUndefined();

      expect(archer3?.totalScore).toBe(40);
      expect(archer3?.currentPosition).toBe(2);
      expect(archer3?.previousPosition).toBe(3);
    });
  });
}

/**
 * Helper function to create a test shoot
 */
function createTestShoot(code: string, creatorName: string): Shoot {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setHours(23, 59, 59, 999);

  return {
    id: `test_${Date.now()}`,
    code,
    creatorName,
    createdAt: now,
    expiresAt,
    participants: [],
    lastUpdated: now
  };
}