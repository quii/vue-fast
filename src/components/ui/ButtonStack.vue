<script setup>
defineProps({
  spacing: {
    type: String,
    default: "medium",
    validator: (value) => ["small", "medium", "large"].includes(value)
  }
});
</script>

<template>
  <div class="button-stack" :class="`spacing-${spacing}`">
    <slot></slot>
  </div>
</template>

<style scoped>
.button-stack {
  display: flex;
  flex-direction: column;
}

.spacing-small > :deep(*:not(:last-child)) {
  margin-bottom: 0.25rem;
}

.spacing-medium > :deep(*:not(:last-child)) {
  margin-bottom: 0.5rem;
}

.spacing-large > :deep(*:not(:last-child)) {
  margin-bottom: 0.75rem;
}
</style>
