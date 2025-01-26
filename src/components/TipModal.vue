<script setup>
const emit = defineEmits(["close"]);
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>Viewing Tips 💡</h2>

      <p>Try turning your phone into landscape mode to see the full scoresheet with additional calculations and
        statistics.</p>

      <div class="button-group">
        <button class="primary" @click="emit('close')">Got it!</button>
      </div>
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

.button-group {
  margin-top: 2rem;
}

button.primary {
  display: block;
  margin: 0 auto;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
</style>
