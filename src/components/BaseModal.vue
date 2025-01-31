<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <slot></slot>
    </div>
  </div>
</template>
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-background);
  color: var(--color-text);
  padding: 2.5rem;
  margin: 0 1rem;
  border-radius: 12px;
  min-width: 400px;
  text-align: center;
}
</style>
