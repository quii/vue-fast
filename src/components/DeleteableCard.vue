<script setup>
import { ref, computed } from 'vue';
import BaseCard from '@/components/BaseCard.vue';

const props = defineProps({
  indicator: {
    type: Object,
    default: null
    // Expected format: { text: 'Text', class: 'class-name' }
  }
});

const emit = defineEmits(['click', 'delete']);

// State for swipe functionality
const isDeleting = ref(false);
const startX = ref(0);
const currentX = ref(0);
const deleteThreshold = 80; // Pixels to swipe to reveal delete button

// Touch event handlers
function handleTouchStart(event) {
  startX.value = event.touches[0].clientX;
  currentX.value = 0;
}

function handleTouchMove(event) {
  // Only handle horizontal swipes to avoid interfering with vertical scrolling
  const touchX = event.touches[0].clientX;
  const touchY = event.touches[0].clientY;
  const diffX = touchX - startX.value;

  // Only allow swiping left (negative diffX)
  if (diffX < 0) {
    // Only try to prevent default if the swipe is more horizontal than vertical
    // This avoids conflicts with scrolling
    if (Math.abs(diffX) > Math.abs(touchY - event.touches[0].clientY) && event.cancelable) {
      event.preventDefault();
    }

    currentX.value = diffX;
  }
}

function handleTouchEnd() {
  // If swiped far enough, show delete button
  if (currentX.value < -deleteThreshold) {
    isDeleting.value = true;
  } else {
    // Reset position
    resetSwipe();
  }
}

function resetSwipe() {
  currentX.value = 0;
  isDeleting.value = false;
}

function handleCardClick() {
  // Only emit click if not in delete mode
  if (!isDeleting.value) {
    emit('click');
  } else {
    // If in delete mode, clicking the card should reset it
    resetSwipe();
  }
}

function handleDelete() {
  // Emit delete event
  emit('delete');
}

// Calculate transform style based on current swipe position
const cardStyle = computed(() => {
  if (isDeleting.value) {
    return { transform: `translateX(-${deleteThreshold}px)` };
  }
  if (currentX.value < 0) {
    return { transform: `translateX(${currentX.value}px)` };
  }
  return {};
});
</script>

<template>
  <div class="deleteable-card-container" :class="{ 'is-swiping': isDeleting || currentX < 0 }">
    <!-- Delete button that appears when swiped -->
    <div class="delete-button" @click.stop="handleDelete">
      <span>Delete</span>
    </div>

    <!-- The actual card -->
    <div
      class="deleteable-card"
      :class="{ 'is-deleting': isDeleting }"
      :style="cardStyle"
      @click="handleCardClick"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <BaseCard :indicator="indicator">
        <slot></slot>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.deleteable-card-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  touch-action: pan-y; /* Allow vertical scrolling but capture horizontal swipes */
}

.deleteable-card {
  transition: transform 0.2s ease;
  position: relative;
  z-index: 1;
  width: 100%;
}

.deleteable-card :deep(.base-card) {
  margin-bottom: 0; /* Remove margin from BaseCard as container handles spacing */
}

.delete-button {
  position: absolute;
  top: 0;
  right: -80px; /* Position it outside the container initially */
  height: 100%;
  width: 80px;
  background-color: #dc3545;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  z-index: 0;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  cursor: pointer;
}

/* Add this to ensure the delete button is properly positioned when swiping */
.deleteable-card-container.is-swiping .delete-button {
  right: 0;
}
</style>