<script setup>
defineProps({
  variant: {
    type: String,
    default: "default",
    validator: (value) => ["default", "primary", "danger", "outline"].includes(value)
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: "medium",
    validator: (value) => ["small", "medium", "large"].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: null
  }
});
</script>

<template>
  <button
    :id="id"
    :class="[
      'base-button',
      `variant-${variant}`,
      `size-${size}`,
      { 'full-width': fullWidth }
    ]"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>
<style scoped>
.base-button {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease, opacity 0.2s ease;
  border: none;
  margin: 0.5em 0.75em; /* Added horizontal margins */
}

.base-button:active {
  transform: scale(0.98);
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Size variants */
.size-small {
  font-size: 0.9em;
  padding: 0.5em 0.75em;
}

.size-medium {
  font-size: 1em;
  padding: 0.75em 1em;
}

.size-large {
  font-size: 1.2em;
  padding: 0.75em 1.25em;
}

/* Width */
.full-width {
  width: calc(100% - 1.5em); /* Adjust width to account for margins */
}

/* Color variants */
.variant-default {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.variant-default:active {
  background-color: var(--color-background-mute);
}

.variant-primary {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.variant-primary:active {
  background-color: var(--color-highlight-dark, #388E3C);
}

.variant-danger {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.2);
}

.variant-danger:active {
  background-color: rgba(220, 53, 69, 0.2);
}

.variant-outline {
  background-color: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.variant-outline:active {
  background-color: var(--color-background-soft);
}
</style>
