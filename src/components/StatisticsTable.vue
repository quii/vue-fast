<template>
  <div class="statistics-table">
    <div class="table-header">
      <span class="metric-label">Statistic</span>
      <span class="value-header">Value</span>
    </div>
    
    <div v-for="(stat, index) in statistics" :key="index" class="table-row">
      <span class="metric-label">{{ stat.label }}</span>
      <span class="stat-value" :class="stat.highlight ? 'highlight' : ''">{{ stat.value }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  statistics: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.statistics-table {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-background);
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: 0.75rem;
  gap: 1rem;
}

.table-header {
  background-color: var(--color-background-soft);
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.table-row {
  border-bottom: 1px solid var(--color-border);
}

.table-row:last-child {
  border-bottom: none;
}

.metric-label {
  color: var(--color-text);
  font-weight: 500;
}

.value-header {
  color: var(--color-text);
  font-weight: 600;
  text-align: right;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: right;
}

.stat-value.highlight {
  color: var(--color-highlight);
}
</style>