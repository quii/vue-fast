<script setup>
import BaseModal from "./BaseModal.vue";

const emit = defineEmits(["close"]);
</script>

<template>
  <BaseModal>
    <h2>Filter Your History 🎯</h2>

    <div class="tips">
      <p><strong>📅</strong> Filter by date range</p>
      <p><strong>🏹</strong> Show only specific rounds</p>
      <p><strong>🏅</strong> Filter by classification achieved</p>
      <p><strong>🌟</strong> Toggle personal bests</p>
      <p><strong>🔄</strong> Reset all filters</p>
    </div>

    <div class="button-group">
      <button class="primary" @click="emit('close')">Got it!</button>
    </div>
  </BaseModal>
</template>

<style scoped>
.tips {
  text-align: left;
  margin: 2rem 0;
}

.tips p {
  margin: 1rem 0;
  font-size: 1.1rem;
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
}
</style>
