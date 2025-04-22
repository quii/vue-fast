<script setup>
import BaseModal from '@/components/modals/BaseModal.vue'
import IndoorIcon from '@/components/icons/IndoorIcon.vue'
import OutdoorIcon from '@/components/icons/OutdoorIcon.vue'
import MetricIcon from '@/components/icons/MetricIcon.vue'
import ImperialIcon from '@/components/icons/ImperialIcon.vue'
import PracticeIcon from '@/components/icons/PracticeIcon.vue'
import TargetIcon from '@/components/icons/TargetIcon.vue'
import SearchIcon from '@/components/icons/SearchIcon.vue'

const emit = defineEmits(['close'])
</script>

<template>
  <BaseModal title="Finding Your Round">
    <p class="compact-text">Use the filter buttons to narrow down rounds:</p>

    <div class="filter-guide">
      <div class="filter-item">
        <div class="icon-container">
          <IndoorIcon class="filter-icon" />
        </div>
        <div class="filter-description">
          <strong>Indoor</strong> - Rounds shot indoors
        </div>
      </div>

      <div class="filter-item">
        <div class="icon-container">
          <OutdoorIcon class="filter-icon" />
        </div>
        <div class="filter-description">
          <strong>Outdoor</strong> - Rounds shot outdoors
        </div>
      </div>

      <div class="filter-item">
        <div class="icon-container">
          <MetricIcon class="filter-icon" />
        </div>
        <div class="filter-description">
          <strong>Metric</strong> - Rounds using meters
        </div>
      </div>

      <div class="filter-item">
        <div class="icon-container">
          <ImperialIcon class="filter-icon" />
        </div>
        <div class="filter-description">
          <strong>Imperial</strong> - Rounds using yards
        </div>
      </div>

      <div class="filter-item">
        <div class="icon-container">
          <PracticeIcon class="filter-icon" />
        </div>
        <div class="filter-description">
          <strong>Practice</strong> - Practice rounds
        </div>
      </div>

      <div class="filter-item">
        <div class="icon-container">
          <TargetIcon class="filter-icon" />
        </div>
        <div class="filter-description">
          <strong>For You</strong> - Rounds for your level
        </div>
      </div>
    </div>

    <div class="section-divider"></div>

    <div class="compact-section">
      <p class="compact-text"><strong>Distance Sliders:</strong> Adjust to find rounds within your preferred range.</p>
      <div class="slider-example">
        <div class="slider-line">
          <div class="slider-thumb"></div>
        </div>
      </div>
    </div>

    <div class="section-divider"></div>

    <div class="compact-section">
      <p class="compact-text"><strong>Search:</strong> Find rounds by name regardless of other filters.</p>
      <div class="search-example">
        <SearchIcon class="search-icon" />
        <div class="search-bar-example"></div>
      </div>
    </div>

    <div class="section-divider"></div>

    <p class="tip-highlight">Then <strong>tap a round card</strong> to select it for scoring.</p>

    <div class="button-group">
      <button class="primary" @click="emit('close')">Got it!</button>
    </div>
  </BaseModal>
</template>

<style scoped>
.button-group {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

button.primary {
  display: block;
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  background: var(--color-highlight, #4CAF50);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.tip-highlight {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: var(--color-background-soft);
  border-left: 3px solid var(--color-highlight, #4CAF50);
  border-radius: 4px;
  font-size: 0.9rem;
}

.filter-guide {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0.5rem 0;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: var(--color-background-soft);
  border-radius: 4px;
  flex-shrink: 0;
}

.filter-icon {
  width: 16px;
  height: 16px;
  color: var(--color-highlight, #4CAF50);
}

.filter-description {
  flex: 1;
  font-size: 0.85rem;
}

.section-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 0.6rem 0;
  opacity: 0.5;
}

.compact-section {
  margin: 0.4rem 0;
}

.compact-text {
  font-size: 0.85rem;
  margin: 0.3rem 0;
}

.slider-example {
  margin: 0.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slider-line {
  width: 80%;
  height: 4px;
  background-color: var(--color-background-soft);
  border-radius: 2px;
  position: relative;
  margin: 0.5rem 0;
}

.slider-thumb {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: var(--color-highlight, #4CAF50);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.search-example {
  display: flex;
  align-items: center;
  background-color: var(--color-background-soft);
  border-radius: 4px;
  padding: 0.3rem 0.5rem;
  margin: 0.5rem 0;
  height: 24px;
}

.search-icon {
  width: 14px;
  height: 14px;
  color: var(--color-text-light);
  margin-right: 0.3rem;
}

.search-bar-example {
  flex: 1;
  height: 16px;
  background-color: var(--color-background);
  border-radius: 3px;
}

strong {
  color: var(--color-highlight, #4CAF50);
  font-weight: bold;
}
</style>