import { SharingPort, ScoresheetOptions } from '@/domain/ports/sharing'
import { HistoryItem } from '@/domain/repositories/player_history'

export class FakeSharingService implements SharingPort {
  public generateCalls: { historyItem: HistoryItem, options: ScoresheetOptions }[] = []
  public shareCalls: { dataUrl: string, text: string }[] = []
  public copyCalls: string[] = []

  public scoresheetResult = 'data:image/png;base64,fakeData'
  public copySuccess = true
  public isNativeSharingSupported = false

  async generateScoresheet(historyItem: HistoryItem, options: ScoresheetOptions): Promise<string> {
    this.generateCalls.push({ historyItem, options })
    return this.scoresheetResult
  }

  async shareScoresheet(dataUrl: string, text: string): Promise<void> {
    this.shareCalls.push({ dataUrl, text })
  }

  async copyScoresheet(dataUrl: string): Promise<boolean> {
    this.copyCalls.push(dataUrl)
    return this.copySuccess
  }

  canShareNatively(): boolean {
    return this.isNativeSharingSupported
  }
}