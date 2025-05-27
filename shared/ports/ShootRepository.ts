import { Shoot } from '../models/Shoot.js';

/**
 * Repository interface for shoot persistence
 */
export interface ShootRepository {
  /**
   * Saves a shoot to the repository
   * @param shoot The shoot to save
   * @returns Promise that resolves when the operation is complete
   */
  saveShoot(shoot: Shoot): Promise<void>;

  /**
   * Retrieves a shoot by its code
   * @param code The 4-digit code of the shoot
   * @returns Promise with the shoot or null if not found
   */
  getShootByCode(code: string): Promise<Shoot | null>;

  /**
   * Deletes a shoot from the repository
   * @param code The 4-digit code of the shoot
   * @returns Promise that resolves when the operation is complete
   */
  deleteShoot(code: string): Promise<void>;

  /**
   * Checks if a shoot code already exists
   * @param code The 4-digit code to check
   * @returns Promise with boolean indicating if the code exists
   */
  codeExists(code: string): Promise<boolean>;
}