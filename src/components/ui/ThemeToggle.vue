<script setup lang="ts">
import { ref, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import FormGroup from '@/components/ui/FormGroup.vue'
import DeviceThemeIcon from '@/components/icons/DeviceThemeIcon.vue'
import LightThemeIcon from '@/components/icons/LightThemeIcon.vue'
import DarkThemeIcon from '@/components/icons/DarkThemeIcon.vue'

const props = defineProps({
  label: {
    type: String,
    default: 'Theme'
  }
})

const themeStore = useThemeStore()
const selectedTheme = ref(themeStore.preferences.mode)

watch(selectedTheme, (newTheme) => {
  themeStore.setTheme(newTheme)
})

// Function to handle theme selection
function selectTheme(theme: string) {
  selectedTheme.value = theme
}
</script>

<template>
  <FormGroup :label="label">
    <div class="theme-toggle">
      <button
        class="theme-option"
        :class="{ active: selectedTheme === 'device' }"
        @click="selectTheme('device')"
        aria-label="Device theme"
        type="button"
      >
        <DeviceThemeIcon class="icon" />
        <span>Device</span>
      </button>

      <button
        class="theme-option"
        :class="{ active: selectedTheme === 'light' }"
        @click="selectTheme('light')"
        aria-label="Light theme"
        type="button"
      >
        <LightThemeIcon class="icon" />
        <span>Light</span>
      </button>

      <button
        class="theme-option"
        :class="{ active: selectedTheme === 'dark' }"
        @click="selectTheme('dark')"
        aria-label="Dark theme"
        type="button"
      >
        <DarkThemeIcon class="icon" />
        <span>Dark</span>
      </button>

      <!-- Hidden radio inputs for accessibility and form submission -->
      <input type="radio" name="theme" value="device" v-model="selectedTheme" class="sr-only" />
      <input type="radio" name="theme" value="light" v-model="selectedTheme" class="sr-only" />
      <input type="radio" name="theme" value="dark" v-model="selectedTheme" class="sr-only" />
    </div>
  </FormGroup>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  background-color: var(--color-background-mute);
  border-radius: 12px;
  width: 100%;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text);
}

.icon {
  width: 24px;
  height: 24px;
  margin-bottom: 6px;
  transition: all 0.2s ease;
}

.theme-option span {
  font-size: 0.8rem;
  font-weight: 500;
}

.theme-option:hover {
  background-color: var(--color-background-soft);
}

.theme-option.active {
  background-color: var(--color-background);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.theme-option.active .icon {
  transform: scale(1.1);
}

/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .theme-toggle {
    max-width: 100%;
  }
}
</style>