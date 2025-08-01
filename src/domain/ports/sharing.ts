import { HistoryItem, UserProfile } from '@/domain/repositories/player_history'
import { Shoot } from '../../../shared/models/Shoot'

export interface ScoresheetOptions {
  location?: string
  captainName?: string
  archerName: string
}

export interface LiveShootExportOptions {
  location?: string
  includeScorecards?: boolean
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

  /**
   * Generate a comprehensive export of live shoot results
   * @param shoot The live shoot data to export
   * @param options Additional options for the export
   * @returns A Promise resolving to a data URL representing the complete shoot results
   */
  generateLiveShootExport(shoot: Shoot, options: LiveShootExportOptions): Promise<string>

  /**
   * Share live shoot results via the platform's native sharing mechanism
   * @param dataUrl The data URL of the shoot results to share
   * @param text Optional text to accompany the shared content
   * @returns A Promise that resolves when sharing is complete
   */
  shareLiveShootResults(dataUrl: string, text: string): Promise<void>
}