<template>
  <div class="notification-settings">
    <h4 class="settings-title">📱 Push Notifications</h4>
    <p class="settings-description">
      Choose what notifications you'd like to receive during this shoot.
    </p>

    <div v-if="permissionStatus === 'denied'" class="permission-denied">
      <p>⚠️ Push notifications are blocked. Enable them in your browser settings to receive updates.</p>
    </div>

    <div v-else-if="permissionStatus === 'default'" class="permission-request">
      <p>Enable push notifications to get real-time updates about the leaderboard.</p>
      <BaseButton @click="requestPermission" variant="outline">
        Enable Notifications
      </BaseButton>
    </div>

    <div v-else class="notification-rules">
      <div v-for="rule in availableRules" :key="rule.id" class="rule-option">
        <label class="rule-label">
          <input
            type="checkbox"
            :checked="enabledRules.has(rule.id)"
            @change="toggleRule(rule.id, $event.target.checked)"
            class="rule-checkbox"
          />
          <div class="rule-info">
            <span class="rule-name">{{ rule.name }}</span>
            <span class="rule-description">{{ getRuleDescription(rule.id) }}</span>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps({
  shootCode: {
    type: String,
    required: true
  },
  pushNotificationManager: {
    type: Object,
    required: true
  }
})

const permissionStatus = ref('default')
const enabledRules = ref(new Set())

const availableRules = computed(() => {
  return props.pushNotificationManager.getRules()
})

onMounted(async () => {
  if ('Notification' in window) {
    permissionStatus.value = Notification.permission
  }

  // Load current settings for this shoot
  const settings = props.pushNotificationManager.getShootSettings(props.shootCode)
  enabledRules.value = new Set(settings.enabledRules)
})

async function requestPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    permissionStatus.value = permission
  }
}

function toggleRule(ruleId, enabled) {
  props.pushNotificationManager.enableRuleForShoot(props.shootCode, ruleId, enabled)

  if (enabled) {
    enabledRules.value.add(ruleId)
  } else {
    enabledRules.value.delete(ruleId)
  }

  // Trigger reactivity
  enabledRules.value = new Set(enabledRules.value)
}

function getRuleDescription(ruleId) {
  const descriptions = {
    'leader-dozen-arrows': 'Get notified who\'s leading every 12 arrows shot across all archers',
    'close-competition': 'Alert when the competition is very close (within 5 points)',
    'personal-milestone': 'Celebrate when you hit scoring milestones',
    'position-change': 'Know when someone moves up or down in rankings'
  }
  return descriptions[ruleId] || ''
}
</script>

<style scoped>
.notification-settings {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--color-background-mute, #f8f9fa);
  border-radius: 8px;
  border: 1px solid var(--color-border, #eee);
}

.settings-title {
  margin: 0 0 0.5rem 0;
  color: var(--color-highlight, #4CAF50);
  font-size: 1rem;
  font-weight: 600;
}

.settings-description {
  margin: 0 0 1rem 0;
  color: var(--color-text-mute, #666);
  font-size: 0.9rem;
  line-height: 1.4;
}

.permission-denied,
.permission-request {
  text-align: center;
  padding: 1rem;
}

.permission-denied p {
  color: var(--color-warning, #f39c12);
  margin: 0;
  font-size: 0.9rem;
}

.permission-request p {
  margin: 0 0 1rem 0;
  color: var(--color-text-mute, #666);
  font-size: 0.9rem;
}

.notification-rules {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rule-option {
  display: flex;
  align-items: flex-start;
}

.rule-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  width: 100%;
}

.rule-checkbox {
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.rule-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.rule-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
}

.rule-description {
  color: var(--color-text-mute, #666);
  font-size: 0.8rem;
  line-height: 1.3;
}
</style>