<script setup>
import BaseModal from "@/components/modals/BaseModal.vue";
import DateIcon from '@/components/icons/DateIcon.vue'
import RoundIcon from '@/components/icons/RoundIcon.vue'
import ClassificationIcon from '@/components/icons/ClassificationIcon.vue'
import StatusIcon from '@/components/icons/StatusIcon.vue'
import PersonalBestIcon from '@/components/icons/PersonalBestIcon.vue'
import ResetIcon from '@/components/icons/ResetIcon.vue'

const emit = defineEmits(["close"]);
</script>

<template>
  <BaseModal title="Filter Your History">
    <div class="filter-guide">
      <div class="filter-item">
        <div class="icon-container">
          <DateIcon class="filter-icon" />
        </div>
        <div class="filter-description">
          <strong>Date</strong> - Filter by date range
        </div>
      </div>

      <div class="filter-item">
        <div class="icon-container">
          <RoundIcon class="filter-icon" />
        </div>
        <div class="filter-description">
          <strong>Round</strong> - Show only specific rounds
        </div>
      </div>

      <div class="filter-item">
        <div class="icon-container">
          <ClassificationIcon class="filter-icon" />
        </div>
        <div class="filter-description">
          <strong>Class</strong> - Filter by classification achieved
        </div>
      </div>

      <div class="filter-item">
        <div class="icon-container">
          <StatusIcon class="filter-icon" />
        </div>
        <div class="filter-description">
          <strong>Status</strong> - Filter by shoot status
        </div>
      </div>

      <div class="filter-item">
        <div class="icon-container">
          <PersonalBestIcon class="filter-icon" />
        </div>
        <div class="filter-description">
          <strong>PB</strong> - Toggle personal bests
        </div>
      </div>

      <div class="filter-item">
        <div class="icon-container">
          <ResetIcon class="filter-icon" />
        </div>
        <div class="filter-description">
          <strong>Reset</strong> - Clear all filters
        </div>
      </div>
    </div>

    <div class="button-group">
      <button class="primary" @click="emit('close')">Got it!</button>
    </div>
  </BaseModal>
</template>

<style scoped>
.filter-guide {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin: 1.5rem 0;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: var(--color-background-soft);
  border-radius: 4px;
  flex-shrink: 0;
}

.filter-icon {
  width: 18px;
  height: 18px;
  color: var(--color-highlight, #4CAF50);
}

.filter-description {
  flex: 1;
  font-size: 1rem;
}

.button-group {
  margin-top: 2rem;
}

button.primary {
  display: block;
  margin: 0 auto;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: var(--color-highlight, #4CAF50);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

strong {
  color: var(--color-highlight, #4CAF50);
  font-weight: bold;
}
</style>
