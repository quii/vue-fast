<script setup>
defineProps({
  title: {
    type: String,
    default: ""
  }
});
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h3 v-if="title" class="modal-title">{{ title }}</h3>
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
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90vw;
  max-width: 400px;
  background-color: var(--color-background);
  border-radius: 8px;
  padding: 1.5em;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  color: var(--color-text);
}

.modal-title {
  margin-top: 0;
  color: var(--color-highlight, #4CAF50);
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

@media (max-width: 480px) {
  .modal-content {
    min-width: 0;
    width: 90%;
  }
}
</style>
