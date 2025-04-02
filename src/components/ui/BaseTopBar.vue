<script setup>
import { ref } from "vue";

const props = defineProps({
  // Array of info displays (non-interactive elements)
  infoDisplays: {
    type: Array,
    default: () => []
    // Expected format: [{ value: 'Value', label: 'Label' }]
  },

  // Array of action buttons
  actionButtons: {
    type: Array,
    default: () => []
    /* Expected format:
    [{
      iconComponent: Component, // New prop for component-based icons
      label: 'Button Label',
      action: 'action-name',
      active: false,
      disabled: false,
      variant: 'default' // or 'danger', etc.
    }]
    */
  },

  // Optional expandable content
  hasExpandableContent: {
    type: Boolean,
    default: false
  },

  // Alignment mode for action buttons
  // 'spread' - buttons are evenly spaced
  // 'right' - buttons are aligned to the right
  // 'left' - buttons are aligned to the left
  alignment: {
    type: String,
    default: "spread",
    validator: (value) => ["spread", "right", "left"].includes(value)
  }
});

const emit = defineEmits(["action"]);
const showExpandableContent = ref(false);

function handleAction(actionName, index) {
  if (actionName === "toggle-expand" && props.hasExpandableContent) {
    showExpandableContent.value = !showExpandableContent.value;
  }

  emit("action", { action: actionName, index });
}
</script>

<template>
  <div class="top-bar-container">
    <div class="filters-container">
      <div class="filters" :class="`align-${alignment}`">
        <!-- Info Displays (non-interactive) -->
        <div
          v-for="(info, index) in infoDisplays"
          :key="`info-${index}`"
          class="info-display"
          :class="info.class"
        >
          <div class="info-value">{{ info.value }}</div>
          <div class="info-label">{{ info.label }}</div>
        </div>

        <!-- Spacer if needed for right alignment -->
        <div v-if="alignment === 'right' && infoDisplays.length > 0 && actionButtons.length > 0" class="spacer"></div>

        <!-- Action Buttons -->
        <button
          v-for="(button, index) in actionButtons"
          :key="`action-${index}`"
          class="filter-button"
          :class="{
            'active': button.active,
            'disabled': button.disabled,
            'delete-button': button.variant === 'danger'
          }"
          @click="handleAction(button.action, index)"
          :disabled="button.disabled"
          :aria-label="button.label"
        >
          <div class="filter-icon">
            <!-- Use component if provided, otherwise fallback to v-html -->
            <component v-if="button.iconComponent" :is="button.iconComponent" />
            <div v-else v-html="button.icon"></div>
          </div>
          <span class="filter-label">{{ button.label }}</span>
        </button>
      </div>
    </div>

    <!-- Expandable Content Slot -->
    <div v-if="hasExpandableContent && showExpandableContent" class="expandable-content-container">
      <slot name="expandable-content"></slot>
    </div>
  </div>
</template>

<style scoped>
.top-bar-container {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border-light);
}

.filters-container {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  margin: 0.5em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filters {
  display: flex;
  padding: 0.75em 0.5em;
  align-items: center;
  gap: 0.5rem;
}

/* Alignment modes */
.align-spread {
  justify-content: space-around;
}

.align-right {
  justify-content: flex-start; /* Start from left, but use spacer to push buttons right */
}

.align-left {
  justify-content: flex-start;
}

.spacer {
  flex-grow: 1;
}

.filter-button, .info-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background-color: var(--color-background);
  border: none;
  color: var(--color-text-light);
  transition: all 0.2s ease;
  padding: 0.5em;
}

.filter-button {
  cursor: pointer;
}

.filter-button:active {
  transform: scale(0.95);
}

.filter-button.active {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
}

.filter-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-button.delete-button {
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.2);
}

.filter-button.delete-button:active {
  background-color: rgba(220, 53, 69, 0.2);
}

.info-display {
  background-color: var(--color-background-mute);
  cursor: default;
}

.info-display.wide {
  width: 120px;
}

.filter-icon {
  width: 20px;
  height: 20px;
  margin-bottom: 0.25em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-icon svg {
  width: 100%;
  height: 100%;
}

.filter-label, .info-label {
  font-size: 0.7em;
  font-weight: 500;
  text-align: center;
  line-height: 1;
  margin-bottom: 0.3em;
}

.info-value {
  font-size: 1.2em;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  text-align: center;
}

.expandable-content-container {
  padding: 0 0.5em 0.5em 0.5em;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 768px) {
  .filters {
    gap: 1rem;
  }

  .filter-button {
    width: 70px;
  }

  .info-display.wide {
    width: 140px;
  }
}
</style>
