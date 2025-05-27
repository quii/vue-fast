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
    // Rule: Leader update every dozen arrows
    this.addRule({
      id: 'leader-dozen-arrows',
      name: 'Leader Update (Every 12 Arrows)',
      enabled: true,
      cooldown: 30000, // 30 second cooldown minimum
      condition: (data) => {
        // Trigger when total arrows in the shoot is divisible by 12
        const totalArrows = data.participants.reduce((sum, p) => sum + (p.arrowsShot || 0), 0)
        return totalArrows > 0 && totalArrows % 12 === 0
      },
      message: (data) => {
        const gap = data.participants.length > 1
          ? data.leaderScore - (data.participants[1]?.totalScore || 0)
          : 0

        if (gap > 0) {
          return `🏹 ${data.leaderName} leads by ${gap} points (${data.leaderScore})`
        } else {
          return `🏹 ${data.leaderName} is in the lead with ${data.leaderScore}`
        }
      }
    })

    // Rule: Close competition (within 5 points)
    this.addRule({
      id: 'close-competition',
      name: 'Close Competition Alert',
      enabled: true,
      cooldown: 60000, // 1 minute cooldown
      condition: (data) => {
        if (data.participants.length < 2) return false
        const leader = data.participants[0]
        const second = data.participants[1]
        const gap = leader.totalScore - second.totalScore
        return gap <= 5 && gap > 0 && leader.totalScore > 50 // Only after some meaningful scoring
      },
      message: (data) => {
        const gap = data.participants[0].totalScore - data.participants[1].totalScore
        return `🔥 Tight race! ${data.participants[0].archerName} leads ${data.participants[1].archerName} by just ${gap} points`
      }
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
    if (this.permission !== 'granted' || participants.length === 0) return

    const shootSettings = this.getShootSettings(shootCode)
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
        icon: '/favicon.ico', // or your app icon
        badge: '/favicon.ico',
        tag: `${shootCode}-${ruleId}`, // This replaces previous notifications with same tag
        requireInteraction: false,
        silent: false
      })

      // Auto-close after 4 seconds
      setTimeout(() => notification.close(), 4000)

      // Emit event for other parts of the app
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