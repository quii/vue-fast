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
const startY = ref(0);
const currentX = ref(0);
const deleteThreshold = 80; // Pixels to swipe to reveal delete button
const minHorizontalDistance = 10; // Minimum horizontal movement before considering it a swipe
const isSwipeDetected = ref(false);

// Touch event handlers
function handleTouchStart(event) {
  startX.value = event.touches[0].clientX;
  startY.value = event.touches[0].clientY;
  currentX.value = 0;
  isSwipeDetected.value = false;
}

function handleTouchMove(event) {
  const touchX = event.touches[0].clientX;
  const touchY = event.touches[0].clientY;
  const diffX = touchX - startX.value;
  const diffY = touchY - startY.value;

  // Only process if we haven't detected the gesture type yet or if we're already swiping
  if (!isSwipeDetected.value) {
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);
    
    // Only consider it a horizontal swipe if:
    // 1. Horizontal movement is greater than vertical movement
    // 2. Horizontal movement exceeds minimum threshold
    // 3. It's a leftward swipe (negative diffX)
    if (absX > absY && absX > minHorizontalDistance && diffX < 0) {
      isSwipeDetected.value = true;
    } else if (absY > absX || absY > minHorizontalDistance) {
      // If vertical movement is dominant, let the scroll happen
      return;
    } else {
      // Movement is too small, don't interfere
      return;
    }
  }

  // Only handle the swipe if we've detected it's a horizontal gesture
  if (isSwipeDetected.value && diffX < 0) {
    // Prevent default only after we're sure it's a horizontal swipe
    if (event.cancelable) {
      event.preventDefault();
    }
    currentX.value = diffX;
  }
}

function handleTouchEnd() {
  // Only process if we detected a swipe gesture
  if (isSwipeDetected.value) {
    // If swiped far enough, show delete button
    if (currentX.value < -deleteThreshold) {
      isDeleting.value = true;
    } else {
      // Reset position
      resetSwipe();
    }
  }
  
  // Reset swipe detection
  isSwipeDetected.value = false;
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
  if (isSwipeDetected.value && currentX.value < 0) {
    return { transform: `translateX(${currentX.value}px)` };
  }
  return {};
});
</script>

<template>
  <div class="deleteable-card-container" :class="{ 'is-swiping': isDeleting || (isSwipeDetected && currentX < 0) }">
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