<template>
  <div class="section-card">
    <slot></slot>
  </div>
</template>

<style scoped>
.section-card {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
