<template>
  <h2 class="modal-title">
    <slot></slot>
  </h2>
</template>

<style scoped>
.modal-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  color: var(--color-text);
  text-align: left;
}
</style>
