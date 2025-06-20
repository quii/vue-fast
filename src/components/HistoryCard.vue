<script setup>
import { formatRoundName, formatDateContextually } from '@/domain/scoring/round/formatting.js'
import { ref, computed } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
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
  // Emit delete event with the item id
  emit('delete', props.item.id);
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
  <div class="history-card-container" :class="{ 'is-swiping': isDeleting || currentX < 0 }">
    <!-- Delete button that appears when swiped -->
    <div class="delete-button" @click.stop="handleDelete">
      <span>Delete</span>
    </div>

    <!-- The actual card -->
    <div
      class="history-card"
      :class="{ 'is-deleting': isDeleting }"
      :style="cardStyle"
      @click="handleCardClick"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div
        v-if="item.classification?.name"
        :class="['classification-indicator', item.classification.name, item.classification.scheme]"
      >
        <span class="classification-name" data-test="classification">{{ item.classification.name }}</span>
      </div>
      <div class="card-content">
        <div class="card-main">
          <div class="card-info">
            <h3 class="round-name" data-test="round-name">{{ formatRoundName(item.gameType) }}</h3>
            <div class="card-details">
              <span class="card-date">{{ formatDateContextually(item.date) }}</span>
              <span v-if="item.averagePerEnd" class="average-score">{{ item.averagePerEnd }} / end</span>
            </div>
          </div>
          <div class="score-container">
            <div :class="['card-score', {'highlight': item.topScore}]" data-test="score">{{ item.score }}</div>
            <div v-if="item.handicap" class="handicap">HC: {{ item.handicap }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-card-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  touch-action: pan-y; /* Allow vertical scrolling but capture horizontal swipes */
}

.history-card {
  display: flex;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
  z-index: 1;
  width: 100%;
}

.history-card:active:not(.is-deleting) {
  transform: scale(0.98);
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
.history-card-container.is-swiping .delete-button {
  right: 0;
}

.classification-indicator {
  width: 30px; /* Wider to fit text */
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-align: center;
  padding: 0.5em 0;
}

.classification-name {
  font-weight: bold;
  font-size: 0.85em;
}

.card-content {
  flex-grow: 1;
  padding: 0.75em;
  display: flex;
  flex-direction: column;
  gap: 0.25em;
}

.card-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Changed from center to flex-start to align tops */
}

.card-info {
  display: flex;
  flex-direction: column;
}

.round-name {
  margin: 0;
  font-size: 1.3em; /* Increased from 1.1em to 1.3em */
  font-weight: 600;
}

.card-details {
  display: flex;
  justify-content: space-between; /* This pushes items to opposite ends */
  align-items: center;
  width: 100%;
  margin-top: 0.2em;
  gap: 1em; /* Add explicit gap between items */
}

.card-date {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
}

.average-score {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
  font-weight: 500; /* Slightly bolder than the date */
  margin-left: auto; /* Push to the right */
}

.score-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center the score and handicap */
  gap: 0.2em; /* Small gap between score and handicap */
}

.card-score {
  font-size: 1.3em;
  font-weight: 700;
  padding: 0.2em 0.4em;
  border-radius: 4px;
}

.card-score.highlight {
  background-color: rgba(255, 215, 0, 0.2);
  color: var(--color-text);
}

.handicap {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
  font-style: italic;
}

/* Classification colors */
.B1 {
  background-color: hsl(3, 84%, 36%);
  color: white;
}

.B2 {
  background-color: hsl(3, 84%, 46%);
  color: white;
}

.B3 {
  background-color: hsl(3, 84%, 56%);
  color: white;
}

.A3 {
  background-color: hsl(207, 85%, 90%);
  color: #061345;
}

.A2 {
  background-color: hsl(207, 85%, 80%);
  color: #061345;
}

.A1 {
  background-color: hsl(207, 85%, 72%);
  color: #061345;
}

.MB, .GMB, .EMB {
  background-color: rebeccapurple;
  color: white;
}

.Frostbite {
  color: cornflowerblue;
  font-weight: bold;
}
</style>
