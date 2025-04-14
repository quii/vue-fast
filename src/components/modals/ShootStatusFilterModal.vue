<script setup>
import { ref } from "vue";
import { getAllShootStatuses, getShootStatusDisplayName } from "@/domain/shoot/shoot_status.js";
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import ButtonStack from "@/components/ui/ButtonStack.vue";

const props = defineProps({
  currentStatus: {
    type: String,
    default: null
  }
});

const emit = defineEmits(["close", "select"]);
const selectedStatus = ref(props.currentStatus);
const statuses = getAllShootStatuses();

function selectStatus(status) {
  emit("select", status);
  emit("close");
}

function clearFilter() {
  emit("select", null);
  emit("close");
}
</script>

<template>
  <BaseModal title="Filter by Shoot Status">
    <ButtonStack spacing="medium">
      <BaseButton
        v-for="status in statuses"
        :key="status"
        :variant="selectedStatus === status ? 'primary' : 'outline'"
        @click="selectStatus(status)"
      >
        {{ getShootStatusDisplayName(status) }}
      </BaseButton>
    </ButtonStack>

    <ButtonGroup>
      <BaseButton
        v-if="selectedStatus"
        variant="outline"
        @click="clearFilter"
      >
        Clear Filter
      </BaseButton>
      <BaseButton
        variant="primary"
        @click="emit('close')"
      >
        Cancel
      </BaseButton>
    </ButtonGroup>
  </BaseModal>
</template>
