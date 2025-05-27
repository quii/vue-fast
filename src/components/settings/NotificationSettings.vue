<template>
  <div class="notification-settings">
    <h3>Push Notification Settings</h3>

    <div v-for="rule in rules" :key="rule.id" class="rule-setting">
      <label>
        <input
          type="checkbox"
          :checked="rule.enabled"
          @change="toggleRule(rule.id, $event.target.checked)"
        />
        {{ rule.name }}
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useShootStore } from '@/stores/shoot'

const shootStore = useShootStore()
const rules = ref([])

onMounted(() => {
  // Get rules from the push notification manager
  rules.value = shootStore.getPushNotificationRules()
})

function toggleRule(ruleId, enabled) {
  shootStore.enablePushNotificationRule(ruleId, enabled)
}
</script>