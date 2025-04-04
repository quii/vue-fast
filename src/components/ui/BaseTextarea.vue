<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  placeholder: {
    type: String,
    default: ""
  },
  rows: {
    type: Number,
    default: 5
  }
});

const emit = defineEmits(["update:modelValue"]);

const value = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});
</script>

<template>
  <textarea
    v-model="value"
    :placeholder="placeholder"
    :rows=rows
    class="base-textarea"
  ></textarea>
</template>

<style scoped>
.base-textarea {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background);
  color: var(--color-text);
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s ease;
}

.base-textarea:focus {
  outline: none;
  border-color: var(--color-highlight);
}
</style>
