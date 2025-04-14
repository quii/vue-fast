<script setup>
defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value) => ["primary", "outline", "text", "danger", "default"].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <button
    class="base-button"
    :class="[`variant-${variant}`, { disabled }]"
    :disabled="disabled"
  >
    <span class="button-content">
      <slot></slot>
    </span>
  </button>
</template>

<style scoped>
.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
}

.base-button {
  flex: 1;
  padding: 0.7em;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1em;
}

.base-button:active:not(.disabled) {
  transform: scale(0.98);
}

.variant-primary, .variant-default {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
  border: none;
}

.variant-primary:active:not(.disabled), .variant-default:active:not(.disabled) {
  background-color: var(--color-highlight-bright, #5FDF63);
}


.variant-outline {
  background-color: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border, #ccc);
}

.variant-outline:active:not(.disabled) {
  background-color: var(--color-background-mute, #f5f5f5);
}

.variant-text {
  background-color: transparent;
  color: var(--color-text);
  border: none;
  padding: 0.5em;
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.variant-danger {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.2);
}
</style>
