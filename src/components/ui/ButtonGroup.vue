<template>
  <div class="button-group">
    <slot></slot>
  </div>
</template>

<style scoped>
.button-group {
  display: flex;
  gap: 1em;
  margin-top: 1.5em;
}

.button-group :deep(.base-button) {
  flex: 1;
}
</style>
