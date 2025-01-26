<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <button
    class="save-button"
    :data-test="$attrs['data-test']"
    @click="$emit('click')"
    :disabled="disabled"
  >
    Save Score Sheet 💾
  </button>
</template>

<style scoped>
.save-button {
  display: block;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.save-button:hover {
  background: #45a049;
}

.save-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
</style>
