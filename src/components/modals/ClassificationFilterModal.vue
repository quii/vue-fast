<script setup>
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ButtonStack from "@/components/ui/ButtonStack.vue";
import { classificationList, classificationMap } from "@/domain/scoring/classificationList";

const emit = defineEmits(["close", "select"]);

const filteredClassifications = classificationList.filter(c => c !== "PB");

function handleSelect(classification) {
  emit("select", classification);
  emit("close");
}

function getFullName(classification) {
  return classificationMap[classification] || classification;
}
</script>

<template>
  <BaseModal title="Filter by Classification">
    <ButtonStack spacing="medium">
      <BaseButton
        variant="outline"
        @click="handleSelect('')"
      >
        All Classifications
      </BaseButton>

      <BaseButton
        v-for="classification in filteredClassifications"
        :key="classification"
        variant="outline"
        :class="classification"
        @click="handleSelect(classification)"
      >
        <span class="classification-code">{{ classification }}</span>
        <span class="classification-name">{{ getFullName(classification) }}</span>
      </BaseButton>
    </ButtonStack>
  </BaseModal>
</template>

<style scoped>

/* Classification colors - copied from HistoryCard.vue */
.B1 {
  background-color: hsl(3, 84%, 36%);
  color: white;
  border-color: hsl(3, 84%, 36%);
}

.B2 {
  background-color: hsl(3, 84%, 46%);
  color: white;
  border-color: hsl(3, 84%, 46%);
}

.B3 {
  background-color: hsl(3, 84%, 56%);
  color: white;
  border-color: hsl(3, 84%, 56%);
}

.A3 {
  background-color: hsl(207, 85%, 90%);
  color: #061345;
  border-color: hsl(207, 85%, 80%);
}

.A2 {
  background-color: hsl(207, 85%, 80%);
  color: #061345;
  border-color: hsl(207, 85%, 70%);
}

.A1 {
  background-color: hsl(207, 85%, 72%);
  color: #061345;
  border-color: hsl(207, 85%, 62%);
}

.MB, .GMB, .EMB {
  background-color: rebeccapurple;
  color: white;
  border-color: rebeccapurple;
}
</style>
