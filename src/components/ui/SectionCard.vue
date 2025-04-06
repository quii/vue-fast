<template>
  <div class="section-card">
    <h2 v-if="title" class="section-title">{{ title }}</h2>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ""
  }
});
</script>

<style scoped>
.section-card {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin-top: 0;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}
</style>
