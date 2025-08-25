<template>
  <div class="venue-diary-entry">
    <div class="venue-content">
      <div class="venue-header">
        <h3 class="venue-milestone">
          <MapIcon class="venue-icon" />
          {{ isFirstEver ? 'First Location Recorded!' : 'New Venue Discovered!' }}
        </h3>
        <time class="venue-date">{{ formatDate(date) }}</time>
      </div>
      
      <div class="venue-details">
        <!-- Coordinates and map button all styled consistently -->
        <div class="coordinate-badge">{{ location.latitude.toFixed(4) }}°N</div>
        <div class="coordinate-badge">{{ location.longitude.toFixed(4) }}°W</div>
        <div v-if="showMap" class="map-link" @click="openMap">
          <MapIcon />
          <span>Map</span>
        </div>
      </div>
      
      <!-- Show the associated shoot -->
      <div class="associated-shoot">
        <HistoryCard :item="shoot" />
      </div>
    </div>
  </div>
</template>

<script setup>
import MapIcon from '@/components/icons/MapIcon.vue'
import HistoryCard from '@/components/HistoryCard.vue'

const props = defineProps({
  date: {
    type: String,
    required: true
  },
  location: {
    type: Object,
    required: true
  },
  shoot: {
    type: Object,
    required: true
  },
  isFirstEver: {
    type: Boolean,
    default: false
  },
  showMap: {
    type: Boolean,
    default: false
  }
})

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  })
}

function openMap() {
  // Open location in default map app
  const url = `https://maps.apple.com/?q=${props.location.latitude},${props.location.longitude}`
  window.open(url, '_blank')
}
</script>

<style scoped>
.venue-diary-entry {
  margin-bottom: 0;
}

.venue-content {
  background: color-mix(in srgb, var(--color-background-soft) 85%, #2196F3 15%);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.75rem;
}

.venue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border, rgba(0, 0, 0, 0.1));
}

.venue-milestone {
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.venue-icon {
  width: 1.2rem;
  height: 1.2rem;
}

.venue-date {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #888);
  font-style: italic;
}

.venue-details {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.coordinate-badge {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--color-background-mute);
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #888);
  font-family: monospace;
  white-space: nowrap;
  flex-shrink: 0;
}

.map-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-background-mute);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #888);
  white-space: nowrap;
  flex-shrink: 0;
}

.map-link:hover {
  background: var(--color-border-hover);
}

.map-link svg {
  width: 1rem;
  height: 1rem;
}

.associated-shoot {
  border-top: 1px solid var(--color-border, rgba(0, 0, 0, 0.1));
  padding-top: 1rem;
}

/* Responsive design */
@media (max-width: 640px) {
  .venue-diary-entry {
    margin-bottom: 1.25rem;
  }
  
  .venue-content {
    padding: 1rem;
  }
  
  .venue-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  
  .venue-milestone {
    font-size: 1rem;
  }
  
  .venue-details {
    gap: 0.4rem;
  }
}
</style>