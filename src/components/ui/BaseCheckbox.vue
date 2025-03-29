<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["update:modelValue"]);

const checked = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});
</script>

<template>
  <div class="checkbox-container">
    <input
      type="checkbox"
      :id="'checkbox-' + _uid"
      v-model="checked"
      class="base-checkbox"
    />
    <label :for="'checkbox-' + _uid" class="checkbox-label">{{ label }}</label>
  </div>
</template>

<style scoped>
.checkbox-container {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.base-checkbox {
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
  accent-color: var(--color-highlight);
}

.checkbox-label {
  font-size: 1rem;
  color: var(--color-text);
}
</style>
