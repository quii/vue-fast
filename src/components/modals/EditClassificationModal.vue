<script setup>
import { computed, ref } from "vue";
import BaseModal from "./BaseModal.vue";
import { useUserStore } from "@/stores/user";
import { classificationList } from "@/domain/scoring/classificationList.js";

const userStore = useUserStore();

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  currentClassification: {
    type: String,
    required: true
  },
  environment: {
    type: String,
    required: true,
    validator: (value) => ["indoor", "outdoor"].includes(value)
  },
  bowType: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["close"]);

const selectedClassification = ref(props.currentClassification);
const seasonStartDate = ref(
  props.environment === "indoor"
    ? userStore.user.indoorSeasonStartDate
    : userStore.user.outdoorSeasonStartDate
);

const environmentLabel = computed(() => {
  return props.environment.charAt(0).toUpperCase() + props.environment.slice(1);
});

const bowTypeLabel = computed(() => {
  return props.bowType.charAt(0).toUpperCase() + props.bowType.slice(1);
});

function saveClassification() {
  if (props.environment === "indoor") {
    userStore.setIndoorClassification(props.bowType, selectedClassification.value);
    userStore.user.indoorSeasonStartDate = seasonStartDate.value;
  } else {
    userStore.setOutdoorClassification(props.bowType, selectedClassification.value);
    userStore.user.outdoorSeasonStartDate = seasonStartDate.value;
  }
  emit("close");
}

function closeModal() {
  emit("close");
}
</script>

<template>
  <BaseModal v-if="show">
    <h2>Edit {{ environmentLabel }} {{ bowTypeLabel }} Classification</h2>

    <div class="modal-form">
      <div class="form-group">
        <label>Current Classification</label>
        <select v-model="selectedClassification">
          <option>Unclassified</option>
          <option v-for="option in classificationList" :value="option" :key="option">
            {{ option }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>{{ environmentLabel }} Season Start Date</label>
        <input type="date" v-model="seasonStartDate" />
      </div>

      <div class="modal-actions">
        <button class="secondary" @click="closeModal">Cancel</button>
        <button class="primary" @click="saveClassification">Save</button>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5em;
  text-align: left;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.form-group label {
  font-weight: bold;
}

.form-group select,
.form-group input {
  padding: 0.5em;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1em;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1em;
  margin-top: 1em;
}

button {
  padding: 0.5em 1em;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
  border: none;
}

button.primary {
  background-color: var(--color-primary, #42b883);
  color: white;
}

button.secondary {
  background-color: #e0e0e0;
  color: #333;
}
</style>
