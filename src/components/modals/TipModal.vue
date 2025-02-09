<script setup>
import BaseModal from "@/components/modals/BaseModal.vue";
const emit = defineEmits(["close"]);
</script>

<template>
  <BaseModal>
    <h2>Viewing Tips 💡</h2>

    <p>Try turning your phone into landscape mode to see the full scoresheet with additional calculations and
      statistics.</p>

    <div class="button-group">
      <button class="primary" @click="emit('close')">Got it!</button>
    </div>
  </BaseModal>
</template>

<style scoped>
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
