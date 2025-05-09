<script setup lang="ts">
import { ref, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import FormGroup from '@/components/ui/FormGroup.vue'

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
</script>

<template>
  <FormGroup :label="label">
    <div class="theme-options">
      <label class="theme-option">
        <input type="radio" v-model="selectedTheme" value="device" />
        <span>Device Default</span>
      </label>
      <label class="theme-option">
        <input type="radio" v-model="selectedTheme" value="light" />
        <span>Light</span>
      </label>
      <label class="theme-option">
        <input type="radio" v-model="selectedTheme" value="dark" />
        <span>Dark</span>
      </label>
    </div>
  </FormGroup>
</template>

<style scoped>
.theme-options {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.theme-option input {
  cursor: pointer;
}

.theme-option span {
  font-size: 0.9rem;
}
</style>