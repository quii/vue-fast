<script setup>
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseTextarea from "@/components/ui/BaseTextarea.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import { ref } from "vue";

const props = defineProps({
  initialText: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["close", "save"]);
const noteText = ref(props.initialText);

function saveNote() {
  if (noteText.value.trim()) {
    emit("save", noteText.value);
  }
}
</script>

<template>
  <BaseModal title="Take a Note️">
    <BaseTextarea
      v-model="noteText"
      placeholder="Take note of anything here.

Did the end go well?

Why or why not?

Did you follow your process?"
      rows=10
      class="note-textarea"
    />

    <ButtonGroup>
      <BaseButton
        variant="outline"
        @click="emit('close')"
      >
        Cancel
      </BaseButton>

      <BaseButton
        variant="primary"
        @click="saveNote"
        :disabled="!noteText.trim()"
      >
        Save Note
      </BaseButton>
    </ButtonGroup>
  </BaseModal>
</template>

<style scoped>
.note-textarea {
  min-height: 200px;
}
</style>
