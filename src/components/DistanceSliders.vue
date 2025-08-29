<template>
  <div class="distance-sliders-container">
    <div class="distance-unit-toggle">
      <div class="unit-toggle-buttons">
        <button
          :class="{ active: modelUnit === 'yards' }"
          @click="$emit('update:unit', 'yards')"
        >
          Yards
        </button>
        <button
          :class="{ active: modelUnit === 'meters' }"
          @click="$emit('update:unit', 'meters')"
        >
          Meters
        </button>
      </div>
    </div>
    
    <!-- Min Distance Slider -->
    <div class="distance-slider">
      <label for="min-distance">Minimum Distance: {{ modelMinDistance }} {{ modelUnit }}</label>
      <input
        type="range"
        id="min-distance"
        :value="modelMinDistance"
        @input="$emit('update:minDistance', parseInt($event.target.value))"
        min="0"
        max="200"
        step="1"
      />
    </div>
    
    <!-- Max Distance Slider -->
    <div class="distance-slider">
      <label for="max-distance">Maximum Distance: {{ modelMaxDistance }} {{ modelUnit }}</label>
      <input
        type="range"
        id="max-distance"
        :value="modelMaxDistance"
        @input="$emit('update:maxDistance', parseInt($event.target.value))"
        min="0"
        max="200"
        step="1"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelMinDistance: {
    type: Number,
    required: true
  },
  modelMaxDistance: {
    type: Number,
    required: true
  },
  modelUnit: {
    type: String,
    required: true,
    validator: (value) => ['yards', 'meters'].includes(value)
  }
})

defineEmits(['update:minDistance', 'update:maxDistance', 'update:unit'])
</script>

<style scoped>
.distance-sliders-container {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  padding: 1em 1em 0.25em 1em;
  margin: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.distance-unit-toggle {
  margin-bottom: 1em;
}

.unit-toggle-buttons {
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.unit-toggle-buttons button {
  flex: 1;
  padding: 8px 16px;
  background-color: var(--color-background);
  color: var(--color-text);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  border-right: 1px solid var(--color-border);
}

.unit-toggle-buttons button:last-child {
  border-right: none;
}

.unit-toggle-buttons button.active {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
}

.unit-toggle-buttons button:hover:not(.active) {
  background-color: var(--color-background-mute);
}

.distance-slider {
  margin-bottom: 1em;
}

.distance-slider label {
  display: block;
  margin-bottom: 0.5em;
  font-weight: 500;
}

.distance-slider input[type="range"] {
  width: 100%;
  margin: 0.5em 0;
  height: 8px;
  background: var(--color-background-mute);
  border-radius: 4px;
  outline: none;
}

.distance-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-highlight, #4CAF50);
  cursor: pointer;
}

.distance-slider input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-highlight, #4CAF50);
  cursor: pointer;
  border: none;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .distance-sliders-container {
    margin: 0.5rem;
  }
}
</style>