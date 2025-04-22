<script setup>
import BaseModal from '@/components/modals/BaseModal.vue'

const emit = defineEmits(['close'])
</script>

<template>
  <BaseModal title="Finding Your Round">
    <p>Tap the filters buttons at the top of the page to narrow down rounds by:</p>
    <ul>
      <li><strong>Indoor/Outdoor</strong> - Choose your shooting environment</li>
      <li><strong>Metric/Imperial</strong> - Select your preferred measurement system</li>
      <li><strong>Practice</strong> - Show practice rounds with no fixed arrow count</li>
      <li><strong>For You</strong> - Show rounds appropriate for your classification level that will help you improve
      </li>
    </ul>

    <p>Adjust the distance sliders to find rounds within your preferred shooting range.</p>

    <p>Alternatively, you can use the <strong>Search rounds</strong> textbox to search for round by name</p>

    <p class="tip-highlight">Then <strong>tap a round card</strong> to select it for scoring.</p>

    <div class="button-group">
      <button class="primary" @click="emit('close')">Got it!</button>
    </div>
  </BaseModal>
</template>

<style scoped>
.button-group {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

button.primary {
  display: block;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: var(--color-highlight, #4CAF50);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.tip-highlight {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: var(--color-background-soft);
  border-left: 3px solid var(--color-highlight, #4CAF50);
  border-radius: 4px;
}

ul {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

li {
  margin-bottom: 0.5rem;
}

li strong {
  color: var(--color-highlight, #4CAF50);
}

p {
  margin-bottom: 1rem;
}

strong {
  font-weight: bold;
}
</style>