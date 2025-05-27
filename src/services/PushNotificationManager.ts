import { ShootParticipant } from '@shared/models/Shoot'

interface NotificationRule {
  id: string
  name: string
  enabled: boolean
  condition: (data: NotificationData) => boolean
  message: (data: NotificationData) => string
  cooldown?: number // milliseconds
}

interface NotificationData {
  shootCode: string
  participants: ShootParticipant[]
  updatedArcher: string
  totalArrows: number
  leaderName: string
  leaderScore: number
}

interface ShootNotificationSettings {
  shootCode: string
  enabledRules: Set<string>
  customCooldowns?: Map<string, number>
}

export class PushNotificationManager extends EventTarget {
  private rules: Map<string, NotificationRule> = new Map()
  private lastNotificationTimes: Map<string, number> = new Map()
  private shootSettings: Map<string, ShootNotificationSettings> = new Map()
  private permission: NotificationPermission = 'default'

  constructor() {
    super()
    this.initializePermission()
    this.setupDefaultRules()
  }

  private async initializePermission(): Promise<void> {
    if ('Notification' in window) {
      this.permission = Notification.permission
      if (this.permission === 'default') {
        this.permission = await Notification.requestPermission()
      }
    }
  }

  private setupDefaultRules(): void {
    // Leader update every dozen arrows across all participants
    this.addRule({
      id: 'leader-dozen-arrows',
      name: 'Leader Update (Every 12 Arrows)',
      enabled: true,
      condition: (data) => data.totalArrows > 0 && data.totalArrows % 12 === 0,
      message: (data) => `🏹 After ${data.totalArrows} arrows: ${data.leaderName} leads with ${data.leaderScore}`,
      cooldown: 30000 // 30 seconds
    })

    // Close competition alert
    this.addRule({
      id: 'close-competition',
      name: 'Close Competition Alert',
      enabled: true,
      condition: (data) => {
        if (data.participants.length < 2) return false
        const leader = data.participants[0]
        const second = data.participants[1]
        return (leader.totalScore - second.totalScore) <= 5 && leader.totalScore > 0
      },
      message: (data) => {
        const leader = data.participants[0]
        const second = data.participants[1]
        const gap = leader.totalScore - second.totalScore
        return `🔥 Close competition! ${leader.archerName} leads ${second.archerName} by just ${gap} point${gap !== 1 ? 's' : ''}!`
      },
      cooldown: 60000 // 60 seconds
    })
  }

  addRule(rule: NotificationRule): void {
    this.rules.set(rule.id, rule)
  }

  removeRule(ruleId: string): void {
    this.rules.delete(ruleId)
  }

  enableRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId)
    if (rule) {
      rule.enabled = enabled
    }
  }

  getShootSettings(shootCode: string): ShootNotificationSettings {
    if (!this.shootSettings.has(shootCode)) {
      // Default: enable the leader update rule only
      this.shootSettings.set(shootCode, {
        shootCode,
        enabledRules: new Set(['leader-dozen-arrows'])
      })
    }
    return this.shootSettings.get(shootCode)!
  }

  updateShootSettings(shootCode: string, settings: Partial<ShootNotificationSettings>): void {
    const current = this.getShootSettings(shootCode)
    this.shootSettings.set(shootCode, { ...current, ...settings })
  }

  enableRuleForShoot(shootCode: string, ruleId: string, enabled: boolean): void {
    const settings = this.getShootSettings(shootCode)
    if (enabled) {
      settings.enabledRules.add(ruleId)
    } else {
      settings.enabledRules.delete(ruleId)
    }
  }

  processShootUpdate(shootCode: string, participants: ShootParticipant[], updatedArcher: string): void {
    if (this.permission !== 'granted' || participants.length === 0) {
      return
    }

    // Sort participants by score to get leader
    const sortedParticipants = [...participants].sort((a, b) => b.totalScore - a.totalScore)
    const leader = sortedParticipants[0]

    const data: NotificationData = {
      shootCode,
      participants: sortedParticipants,
      updatedArcher,
      totalArrows: participants.reduce((sum, p) => sum + (p.arrowsShot || 0), 0),
      leaderName: leader.archerName,
      leaderScore: leader.totalScore
    }

    const shootSettings = this.getShootSettings(shootCode)

    // Check each rule, but only if enabled for this shoot
    for (const [ruleId, rule] of this.rules) {
      if (!shootSettings.enabledRules.has(ruleId)) continue

      // Check cooldown (use shoot-specific key)
      const cooldownKey = `${shootCode}-${ruleId}`
      const lastNotification = this.lastNotificationTimes.get(cooldownKey) || 0
      const now = Date.now()
      const cooldown = shootSettings.customCooldowns?.get(ruleId) || rule.cooldown || 0

      if (cooldown && (now - lastNotification) < cooldown) {
        continue
      }

      // Check condition
      if (rule.condition(data)) {
        this.sendNotification(rule.message(data), ruleId, shootCode)
        this.lastNotificationTimes.set(cooldownKey, now)
      }
    }
  }

  private sendNotification(message: string, ruleId: string, shootCode: string): void {
    if (this.permission === 'granted') {
      const notification = new Notification('Fast Archery', {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `${shootCode}-${ruleId}`,
        requireInteraction: false,
        silent: false
      })

      setTimeout(() => notification.close(), 4000)

      this.dispatchEvent(new CustomEvent('notification-sent', {
        detail: { message, ruleId, shootCode }
      }))
    }
  }

  getRules(): NotificationRule[] {
    return Array.from(this.rules.values())
  }

  clearShootSettings(shootCode: string): void {
    this.shootSettings.delete(shootCode)
    // Clear cooldown timers for this shoot
    for (const key of this.lastNotificationTimes.keys()) {
      if (key.startsWith(`${shootCode}-`)) {
        this.lastNotificationTimes.delete(key)
      }
    }
  }
}