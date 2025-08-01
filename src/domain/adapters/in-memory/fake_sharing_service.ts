import { SharingPort, ScoresheetOptions, LiveShootExportOptions } from '@/domain/ports/sharing'
import { HistoryItem } from '@/domain/repositories/player_history'
import { Shoot } from '../../../../shared/models/Shoot'

export class FakeSharingService implements SharingPort {
  public generateCalls: { historyItem: HistoryItem, options: ScoresheetOptions }[] = []
  public shareCalls: { dataUrl: string, text: string }[] = []
  public copyCalls: string[] = []
  public liveShootExportCalls: { shoot: Shoot, options: LiveShootExportOptions }[] = []
  public liveShootShareCalls: { dataUrl: string, text: string }[] = []

  public scoresheetResult = 'data:image/png;base64,fakeData'
  public liveShootExportResult = 'data:image/png;base64,fakeLiveShootData'
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

  async generateLiveShootExport(shoot: Shoot, options: LiveShootExportOptions): Promise<string> {
    this.liveShootExportCalls.push({ shoot, options })
    return this.liveShootExportResult
  }

  async shareLiveShootResults(dataUrl: string, text: string): Promise<void> {
    this.liveShootShareCalls.push({ dataUrl, text })
  }

  canShareNatively(): boolean {
    return this.isNativeSharingSupported
  }
}