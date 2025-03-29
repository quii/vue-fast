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
      <h2 v-if="title" class="modal-title">{{ title }}</h2>
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
  padding: 1.5rem;
  margin: 0 1rem;
  border-radius: 12px;
  min-width: 400px;
  max-width: 90vw;
}

.modal-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  color: var(--color-text);
  text-align: left;
}

@media (max-width: 480px) {
  .modal-content {
    min-width: 0;
    width: 90%;
  }
}
</style>
