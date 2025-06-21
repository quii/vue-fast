<script setup>
defineProps({
  indicator: {
    type: Object,
    default: null
    // Expected format: { text: 'Text', class: 'class-name' }
  }
});
</script>

<template>
  <div class="base-card">
    <div
      v-if="indicator"
      :class="['card-indicator', indicator.class]"
    >
      <span class="indicator-text">{{ indicator.text }}</span>
    </div>
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.base-card {
  display: flex;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.1s ease;
  margin-bottom: 0.75em;
}

.base-card:active {
  transform: scale(0.98);
}

.card-indicator {
  width: 30px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-align: center;
  padding: 0.5em 0;
}

.indicator-text {
  font-weight: bold;
  font-size: 0.85em;
}

.card-content {
  flex-grow: 1;
  padding: 0.75em;
  display: flex;
  flex-direction: column;
  gap: 0.25em;
}
</style>
