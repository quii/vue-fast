<template>
  <div
    class="number-spinner"
    @touchstart="startTouch"
    @touchmove="handleTouch"
    @touchend="endTouch"
  >
    <div class="arrows" :class="{ 'arrows-visible': isTouching }">⌃</div>
    <input
      type="number"
      :value="modelValue"
      @input="$emit('update:modelValue', parseInt($event.target.value))"
      class="spinner-input"
      :min="min"
      :max="max"
      readonly
    />
    <div class="arrows" :class="{ 'arrows-visible': isTouching }">⌄</div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(["update:modelValue"]);
const touchStartY = ref(null);
const isTouching = ref(false);
const sensitivity = 10;

function startTouch(e) {
  touchStartY.value = e.touches[0].clientY;
  isTouching.value = true;
}

function handleTouch(e) {
  if (!touchStartY.value) return;

  const currentY = e.touches[0].clientY;
  const diff = touchStartY.value - currentY;
  if (Math.abs(diff) > sensitivity) {
    const increment = diff > 0 ? 1 : -1;
    const newValue = Math.min(Math.max(props.modelValue + increment, props.min), props.max);
    emit("update:modelValue", newValue);
    touchStartY.value = currentY;
  }
}

function endTouch() {
  touchStartY.value = null;
  isTouching.value = false;
}
</script>

<style scoped>
.number-spinner {
  width: 6rem; /* Doubled from 3rem */
  height: 6rem; /* Doubled from 3rem */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem; /* Doubled from 1.2rem */
  background: linear-gradient(
    to bottom,
    var(--color-background-soft) 0%,
    var(--color-background-mute) 50%,
    var(--color-background-soft) 100%
  );
  color: var(--color-text);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  touch-action: none;
  user-select: none;
}

.spinner-input {
  width: 100%;
  text-align: center;
  border: none;
  background: transparent;
  color: inherit;
  font-size: inherit;
  font-weight: bold;
  -moz-appearance: textfield;
}

.spinner-input::-webkit-outer-spin-button,
.spinner-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.arrows {
  font-size: 1.6rem;
  opacity: 0.3;
  transition: opacity 0.2s;
  color: var(--color-text);
  line-height: 0.8;
}

.arrows-visible {
  opacity: 0.8;
}
</style>
