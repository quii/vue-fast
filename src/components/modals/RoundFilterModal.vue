<script setup>
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";
import BaseButton from "@/components/BaseButton.vue";
import FormGroup from "@/components/ui/FormGroup.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import { ref } from "vue";

defineProps(["rounds"]);
const emit = defineEmits(["close", "select"]);

const selectedRound = ref("");

function handleSelect() {
  emit("select", selectedRound.value);
  emit("close");
}
</script>

<template>
  <BaseModal title="Filter by Round">
    <FormGroup>
      <BaseSelect v-model="selectedRound">
        <option value="">All Rounds</option>
        <option v-for="round in rounds" :key="round" :value="round">
          {{ round }}
        </option>
      </BaseSelect>
    </FormGroup>

    <ButtonGroup>
      <BaseButton
        variant="outline"
        @click="emit('close')"
      >
        Cancel
      </BaseButton>

      <BaseButton
        variant="primary"
        @click="handleSelect"
      >
        Apply Filter
      </BaseButton>
    </ButtonGroup>
  </BaseModal>
</template>

<style scoped>
.round-select {
  width: 100%;
  margin: 1rem 0;
  padding: 0.5rem;
  font-size: 1.1rem;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1.1rem;
  border-radius: 6px;
  cursor: pointer;
}

button.primary {
  background: #4CAF50;
  color: white;
  border: none;
}
</style>
