import { HistoryItem, UserProfile } from '@/domain/repositories/player_history'

export interface ScoresheetOptions {
  location?: string
  captainName?: string
  archerName: string
}

export interface SharingPort {
  /**
   * Generate a shareable representation of a score sheet
   * @param historyItem The shoot/round data to share
   * @param options Additional options for the scoresheet
   * @returns A Promise resolving to a data URL representing the scoresheet
   */
  generateScoresheet(historyItem: HistoryItem, options: ScoresheetOptions): Promise<string>

  /**
   * Share a scoresheet via the platform's native sharing mechanism
   * @param dataUrl The data URL of the scoresheet to share
   * @param text Optional text to accompany the shared content
   * @returns A Promise that resolves when sharing is complete
   */
  shareScoresheet(dataUrl: string, text: string): Promise<void>

  /**
   * Copy a scoresheet to the clipboard
   * @param dataUrl The data URL of the scoresheet to copy
   * @returns A Promise resolving to a boolean indicating success
   */
  copyScoresheet(dataUrl: string): Promise<boolean>

  /**
   * Check if the current device supports native sharing
   */
  canShareNatively(): boolean
}