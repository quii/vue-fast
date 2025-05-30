import { Shoot, ShootParticipant } from '../models/Shoot.js';

/**
 * Service interface for managing shoots
 */
export interface ShootService {
  /**
   * Creates a new shoot with the given creator name
   * @param creatorName Name of the archer creating the shoot
   * @returns Promise with the created shoot details
   */
  createShoot(creatorName: string): Promise<{ shoot: Shoot; code: string }>;

  /**
   * Joins an existing shoot with the given code
   * @param code The 4-digit code of the shoot to join
   * @param archerName Name of the archer joining the shoot
   * @param roundName Name of the round the archer is shooting
   * @returns Promise with success status and shoot details
   */
  joinShoot(code: string, archerName: string, roundName: string): Promise<{ success: boolean; shoot?: Shoot }>;

  /**
   * Updates an archer's score in a shoot
   * @param code The 4-digit code of the shoot
   * @param archerName Name of the archer
   * @param totalScore Current total score
   * @param roundName Name of the round (in case it changed)
   * @param arrowsShot Number of arrows shot so far
   * @returns Promise with success status and updated shoot details
   */
  updateScore(code: string, archerName: string, totalScore: number, roundName: string, arrowsShot: number): Promise<{ success: boolean; shoot?: Shoot }>;

  /**
   * Marks an archer as finished with their round and locks their final score
   * @param code The 4-digit code of the shoot
   * @param archerName Name of the archer
   * @param totalScore Final total score
   * @param roundName Name of the round
   * @param arrowsShot Total number of arrows shot
   * @returns Promise with success status and updated shoot details
   */
  finishShoot(code: string, archerName: string, totalScore: number, roundName: string, arrowsShot: number): Promise<{ success: boolean; shoot?: Shoot }>;

  /**
   * Removes an archer from a shoot
   * @param code The 4-digit code of the shoot
   * @param archerName Name of the archer to remove
   * @returns Promise with success status
   */
  leaveShoot(code: string, archerName: string): Promise<{ success: boolean }>;

  /**
   * Gets the current state of a shoot
   * @param code The 4-digit code of the shoot
   * @returns Promise with the shoot details
   */
  getShoot(code: string): Promise<Shoot | null>;

  /**
   * Checks if a shoot exists and is still active
   * @param code The 4-digit code of the shoot
   * @returns Promise with existence status
   */
  shootExists(code: string): Promise<boolean>;
}