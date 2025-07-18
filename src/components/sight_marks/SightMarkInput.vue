<template>
  <div class="sight-mark-input">
    <!-- Extension Section -->
    <div class="input-section">
      <div class="input-header">
        <label class="input-label">Extension</label>
        <div class="value-display">{{ modelValue.notches }} notches</div>
      </div>
      <div class="extension-controls">
        <div class="slider-container">
          <input
            type="range"
            :value="modelValue.notches"
            @input="updateNotches($event.target.value)"
            min="0"
            max="15"
            step="1"
            class="extension-slider"
          />
          <div class="slider-labels">
            <span>0</span>
            <span>7</span>
            <span>15</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Separator -->
    <div class="section-separator"></div>

    <!-- Height Section -->
    <div class="input-section">
      <div class="input-header">
        <label class="input-label">Height</label>
        <div class="value-display">{{ formatHeight(modelValue.vertical) }}</div>
      </div>
      
      <!-- Component Inputs with Controls (only way to adjust height) -->
      <div class="component-inputs">
        <div class="component-input">
          <div class="number-control">
            <button
              type="button"
              @click="adjustHeight('major', -1)"
              :disabled="modelValue.vertical.major <= 0"
              class="adjust-btn small"
            >
              −
            </button>
            <input
              type="number"
              :value="modelValue.vertical.major"
              @input="updateHeight('major', $event.target.value)"
              min="0"
              max="10"
              class="component-number-input"
            />
            <button
              type="button"
              @click="adjustHeight('major', 1)"
              :disabled="modelValue.vertical.major >= 10"
              class="adjust-btn small"
            >
              +
            </button>
          </div>
        </div>

        <div class="component-input">
          <div class="number-control">
            <button
              type="button"
              @click="adjustHeight('minor', -1)"
              :disabled="modelValue.vertical.minor <= 0"
              class="adjust-btn small"
            >
              −
            </button>
            <input
              type="number"
              :value="modelValue.vertical.minor"
              @input="updateHeight('minor', $event.target.value)"
              min="0"
              max="10"
              class="component-number-input"
            />
            <button
              type="button"
              @click="adjustHeight('minor', 1)"
              :disabled="modelValue.vertical.minor >= 10"
              class="adjust-btn small"
            >
              +
            </button>
          </div>
        </div>

        <div class="component-input">
          <div class="number-control">
            <button
              type="button"
              @click="adjustHeight('micro', -1)"
              :disabled="modelValue.vertical.micro <= 0"
              class="adjust-btn small"
            >
              −
            </button>
            <input
              type="number"
              :value="modelValue.vertical.micro"
              @input="updateHeight('micro', $event.target.value)"
              min="0"
              max="10"
              class="component-number-input"
            />
            <button
              type="button"
              @click="adjustHeight('micro', 1)"
              :disabled="modelValue.vertical.micro >= 10"
              class="adjust-btn small"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    // Expected shape: { notches: number, vertical: { major: number, minor: number, micro: number } }
  }
});

const emit = defineEmits(['update:modelValue']);

// Format height for display
const formatHeight = (vertical) => {
  return `${vertical.major}.${vertical.minor}.${vertical.micro}`;
};

// Update notches (ensure whole numbers only)
const updateNotches = (value) => {
  const newValue = {
    ...props.modelValue,
    notches: Math.round(parseInt(value) || 0)
  };
  emit('update:modelValue', newValue);
};

// Update individual height components
const updateHeight = (component, value) => {
  const numValue = parseInt(value) || 0;
  const clampedValue = Math.max(0, Math.min(10, numValue));
  
  const newValue = {
    ...props.modelValue,
    vertical: {
      ...props.modelValue.vertical,
      [component]: clampedValue
    }
  };
  emit('update:modelValue', newValue);
};

// Adjust height component by increment
const adjustHeight = (component, increment) => {
  const currentValue = props.modelValue.vertical[component];
  const newValue = Math.max(0, Math.min(10, currentValue + increment));
  updateHeight(component, newValue);
};


</script>

<style scoped>
.sight-mark-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.input-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  flex-shrink: 0;
  text-align: left;
}

.value-display {
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  padding: 0.4rem 0.8rem;
  background: var(--color-background-soft);
  border-radius: 6px;
  border: 2px solid var(--color-border);
  color: var(--color-text);
  min-width: 0;
  flex: 1;
}

.section-separator {
  height: 1px;
  background: var(--color-border);
  margin: 0.5rem 0;
}

/* Extension Controls */
.extension-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slider-container {
  position: relative;
}

.extension-slider {
  width: 100%;
  height: 6px;
  background: var(--color-background-mute);
  outline: none;
  border-radius: 3px;
  -webkit-appearance: none;
  appearance: none;
}

.extension-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  background: var(--color-highlight, #007AFF);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.extension-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: var(--color-highlight, #007AFF);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-light, #666);
}

.component-inputs {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}

.component-input {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.number-control {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--color-background-soft);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  padding: 0.25rem;
}

.component-number-input {
  width: 2rem;
  text-align: center;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.2rem;
}

.component-number-input:focus {
  outline: none;
  background: var(--color-background);
  border-radius: 4px;
}

/* Remove spinner arrows */
.component-number-input::-webkit-outer-spin-button,
.component-number-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.component-number-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Buttons */
.adjust-btn {
  background: var(--color-highlight, #007AFF);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 3rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
}

.adjust-btn:hover:not(:disabled) {
  background: var(--color-highlight-hover, #0056CC);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.adjust-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.adjust-btn:disabled {
  background: var(--color-background-mute);
  color: var(--color-text-light, #666);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.adjust-btn.small {
  min-width: 1.5rem;
  padding: 0.2rem 0.4rem;
  font-size: 0.75rem;
  border-radius: 4px;
}

/* Responsive Design */
@media (max-width: 480px) {
  .sight-mark-input {
    gap: 0.75rem;
    padding: 0;
  }
  
  .input-section {
    gap: 0.4rem;
  }
  
  .input-header {
    gap: 0.5rem;
  }
  
  .section-separator {
    margin: 0.3rem 0;
    background: var(--color-background-mute);
  }
  
  .component-inputs {
    gap: 0.4rem;
  }
  
  .value-display {
    font-size: 0.9rem;
    padding: 0.3rem 0.6rem;
  }
  
  .component-number-input {
    width: 1.8rem;
    font-size: 0.8rem;
  }
  
  .adjust-btn.small {
    min-width: 1.3rem;
    padding: 0.15rem 0.3rem;
    font-size: 0.7rem;
  }
}
</style>
