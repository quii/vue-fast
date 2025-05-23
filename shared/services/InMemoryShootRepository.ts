import { Shoot } from '../models/Shoot.js';
import { ShootRepository } from '../ports/ShootRepository.js';

export class InMemoryShootRepository implements ShootRepository {
  private shoots: Map<string, Shoot> = new Map();

  async saveShoot(shoot: Shoot): Promise<void> {
    this.shoots.set(shoot.code, { ...shoot });
  }

  async getShootByCode(code: string): Promise<Shoot | null> {
    const shoot = this.shoots.get(code);
    if (!shoot) {
      return null;
    }

    // Check if the shoot has expired
    if (new Date() > shoot.expiresAt) {
      this.shoots.delete(code);
      return null;
    }

    return { ...shoot };
  }

  async deleteShoot(code: string): Promise<void> {
    this.shoots.delete(code);
  }

  async codeExists(code: string): Promise<boolean> {
    return this.shoots.has(code);
  }

  // Helper method for testing
  clear(): void {
    this.shoots.clear();
  }
}