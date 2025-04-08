<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(["update:modelValue"]);

function toggleMode() {
  emit("update:modelValue", !props.modelValue);
}
</script>

<template>
  <div class="card-mode-toggle">
    <button
      class="toggle-button"
      @click="toggleMode"
      :title="modelValue ? 'Show detailed cards' : 'Show compact cards'"
    >
      <div class="toggle-icon-container">
        <svg v-if="modelValue" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toggle-icon">
          <polyline points="7 13 12 18 17 13"></polyline>
          <polyline points="7 6 12 11 17 6"></polyline>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toggle-icon">
          <polyline points="7 11 12 6 17 11"></polyline>
          <polyline points="7 18 12 13 17 18"></polyline>
        </svg>
      </div>
      <span v-if="modelValue">Show Details</span>
      <span v-else>Compact View</span>
    </button>
  </div>
</template>

<style scoped>
.card-mode-toggle {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.toggle-button {
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.5em 1em;
  font-size: 0.85em;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5em;
  color: var(--color-text);
}

.toggle-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-icon {
  display: block;
}
</style>
