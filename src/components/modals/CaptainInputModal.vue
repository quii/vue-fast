<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import { ref } from 'vue'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'submit'])
const captainName = ref('')

function handleSubmit() {
  if (captainName.value.trim()) {
    emit('submit', captainName.value)
    captainName.value = ''
  }
}

function handleCancel() {
  captainName.value = ''
  emit('close')
}
</script>

<template>
  <div v-if="show" class="captain-prompt-overlay">
    <div class="captain-prompt-modal">
      <h3>Target Captain Required</h3>
      <p>Please enter the target captain's name to download the PDF.</p>

      <div class="form-group">
        <label for="captain">Target Captain's Name</label>
        <input
          id="captain"
          v-model="captainName"
          type="text"
          placeholder="Enter name"
          autofocus
          @keyup.enter="handleSubmit"
        >
      </div>

      <div class="captain-prompt-buttons">
        <BaseButton
          type="button"
          variant="text"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>

        <BaseButton
          type="button"
          variant="primary"
          @click="handleSubmit"
          :disabled="!captainName.trim()"
          data-test="captain-submit-button"
        >
          Download PDF
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.captain-prompt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.captain-prompt-modal {
  background-color: var(--color-background);
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

p {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.captain-prompt-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>