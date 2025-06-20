<script setup>
import BaseModal from './BaseModal.vue';
import BaseButton from '../ui/BaseButton.vue';
import ButtonGroup from '../ui/ButtonGroup.vue';

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  itemName: {
    type: String,
    default: "this item"
  }
});

const emit = defineEmits(['confirm', 'cancel']);

function handleConfirm() {
  emit('confirm');
}

function handleCancel() {
  emit('cancel');
}
</script>

<template>
  <BaseModal v-if="visible" title="Delete Score">
    <div class="delete-modal-content">
      <p class="delete-message">
        Are you sure you want to delete {{ itemName }}? This action cannot be undone.
      </p>

      <ButtonGroup>
        <BaseButton
          variant="danger"
          @click="handleConfirm"
        >
          Delete
        </BaseButton>
        <BaseButton
          variant="outline"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>
      </ButtonGroup>
    </div>
  </BaseModal>
</template>

<style scoped>
.delete-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.delete-message {
  margin: 0;
  color: var(--color-text);
  line-height: 1.5;
}
</style>