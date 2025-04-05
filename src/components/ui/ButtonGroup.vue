<template>
  <div class="button-group">
    <slot></slot>
  </div>
</template>

<style scoped>
.button-group {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.5rem;
}

.button-group :deep(.base-button:last-child) {
  margin-right: 0;
}

.button-group :deep(.base-button:first-child) {
  margin-left: 0;
}
</style>
