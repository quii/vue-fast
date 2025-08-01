<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ""
  },
  type: {
    type: String,
    default: "text"
  },
  placeholder: {
    type: String,
    default: ""
  },
  maxlength: {
    type: [String, Number],
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:modelValue"]);

const value = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});
</script>

<template>
  <input
    :type="type"
    v-model="value"
    :placeholder="placeholder"
    :maxlength="maxlength"
    :disabled="disabled"
    class="base-input"
  />
</template>

<style scoped>
.base-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.2s ease;
}

.base-input:focus {
  outline: none;
  border-color: var(--color-highlight);
}

.base-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--color-background-mute, #f5f5f5);
}

.base-input[type="color"] {
  height: 40px;
  padding: 0.25rem;
}

.base-input[type="date"] {
  font-family: inherit;
}
</style>
