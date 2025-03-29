<script setup>
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseButton from "@/components/BaseButton.vue";
import FormGroup from "@/components/ui/FormGroup.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import { ref } from "vue";

const emit = defineEmits(["close", "select"]);
const startDate = ref("");
const endDate = ref(new Date().toISOString().split("T")[0]);

function handleSelect() {
  emit("select", { startDate: startDate.value, endDate: endDate.value });
  emit("close");
}
</script>

<template>
  <BaseModal title="Filter by Date Range">
    <FormGroup label="From">
      <BaseInput type="date" v-model="startDate" />
    </FormGroup>

    <FormGroup label="To">
      <BaseInput type="date" v-model="endDate" />
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
