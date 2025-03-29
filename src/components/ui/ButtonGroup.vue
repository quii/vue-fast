<template>
  <div class="button-group">
    <slot></slot>
  </div>
</template>

<style scoped>
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  /* Ensure no right padding/margin that would cause misalignment */
  padding-right: 0;
  margin-right: 0;
}

/* Override the right margin of the last button */
.button-group :deep(.base-button:last-child) {
  margin-right: 0;
}
</style>
