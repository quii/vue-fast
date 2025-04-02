<script setup>
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import FormGroup from "@/components/ui/FormGroup.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import { ref } from "vue";
import { classificationList } from "@/domain/scoring/classificationList";

const emit = defineEmits(["close", "select"]);
const selectedClassification = ref("");

const filteredClassifications = classificationList.filter(c => c !== "PB");

function handleSelect() {
  emit("select", selectedClassification.value);
  emit("close");
}
</script>

<template>
  <BaseModal title="Filter by Classification">
    <FormGroup>
      <BaseSelect v-model="selectedClassification">
        <option value="">All Classifications</option>
        <option v-for="classification in filteredClassifications" :key="classification" :value="classification">
          {{ classification }}
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
