<script setup>
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseButton from '@/components/ui/BaseButton.vue'
import ButtonGroup from '@/components/ui/ButtonGroup.vue'

const emit = defineEmits(["close"]);
</script>

<template>
  <BaseModal title="Viewing Tips">
    <p>Try turning your phone into landscape mode to see the full scoresheet with additional calculations and
      statistics.</p>

    <ButtonGroup>
      <BaseButton
        variant="primary"
        @click="emit('close')"
      >
        Got it!
      </BaseButton>
    </ButtonGroup>
  </BaseModal>
</template>