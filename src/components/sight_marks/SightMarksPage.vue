<template>
  <div class="sight-marks">
    <button class="add-button" @click="showAddMark = true">Add Sight Mark</button>

    <div v-if="showAddMark" class="fullscreen-dialog">
      <div class="dialog-content">
        <div class="distance-control control-group">
          <label>Distance</label>
          <div class="distance-inputs">
            <input type="number" v-model="newMark.distance" class="distance-number" />
            <select v-model="newMark.unit" class="unit-select">
              <option value="m">Metres</option>
              <option value="yd">Yards</option>
            </select>
          </div>
        </div>

        <div class="notches-control control-group">
          <label>Extension</label>
          <div class="slider-value">{{ displayNotches }} notches</div>
          <input
            type="range"
            v-model="notchesValue"
            min="0"
            max="15"
            step="1"
            class="horizontal-slider"
          />
        </div>

        <div class="vertical-control">
          <label>Height: {{ formatVertical(newMark.vertical) }}</label>
          <input
            type="range"
            v-model="verticalValue"
            min="0"
            max="1000"
            step="1"
            class="vertical-slider"
            orient="vertical"
            style="transform: rotate(180deg)"
          />
        </div>

        <div class="dialog-actions">
          <button class="secondary" @click="showAddMark = false">Cancel</button>
          <button class="primary" @click="saveMark">Save</button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="fullscreen-dialog">
      <div class="dialog-content">
        <h2>Delete Sight Mark?</h2>
        <p>Are you sure you want to delete {{ markToDelete.distance }}{{ markToDelete.unit }}?</p>
        <div class="dialog-actions">
          <button class="secondary" @click="cancelDelete">Cancel</button>
          <button class="primary" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>

    <div class="marks-list">
      <div
        v-for="mark in marks"
        :key="`${mark.distance}${mark.unit}`"
        class="mark-card"
        @click="editMark(mark)"
        @touchstart="startLongPress(mark)"
        @touchend="cancelLongPress"
      >
        <div class="mark-distance">{{ mark.distance }}{{ mark.unit }}</div>
        <div class="mark-details">
          <div>Extension: {{ mark.notches }} notches</div>
          <div>Height: {{ formatVertical(mark.vertical) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useSightMarksStore } from "@/stores/sight_marks";

const store = useSightMarksStore();
const marks = computed(() => store.getMarks());

const showAddMark = ref(false);
const showDeleteConfirm = ref(false);
const markToDelete = ref(null);
const longPressTimer = ref(null);

const newMark = ref({
  distance: 20,
  unit: "m",
  notches: 2,
  vertical: {
    major: 5,
    minor: 6,
    micro: 2
  }
})

const verticalValue = computed({
  get() {
    const { major, minor, micro } = newMark.value.vertical;
    return major * 100 + minor * 10 + micro;
  },
  set(value) {
    const major = Math.floor(value / 100);
    const minor = Math.floor((value % 100) / 10);
    const micro = value % 10;
    newMark.value.vertical = { major, minor, micro };
  }
})

const notchesValue = computed({
  get() {
    return 15 - newMark.value.notches;
  },
  set(value) {
    newMark.value.notches = 15 - value;
  }
})

const displayNotches = computed(() => newMark.value.notches);

function formatVertical(vertical) {
  return `${vertical.major}.${vertical.minor}.${vertical.micro}`;
}

function saveMark() {
  const { distance, unit, notches, vertical } = newMark.value;
  if (marks.value.some(m => m.distance === distance && m.unit === unit)) {
    store.updateMark(distance, unit, notches, vertical);
  } else {
    store.addMark(distance, unit, notches, vertical);
  }
  showAddMark.value = false;
}

function editMark(mark) {
  newMark.value = { ...mark };
  showAddMark.value = true;
}

function startLongPress(mark) {
  longPressTimer.value = setTimeout(() => {
    markToDelete.value = mark;
    showDeleteConfirm.value = true;
  }, 500);
}

function cancelLongPress() {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
}

function confirmDelete() {
  store.deleteMark(markToDelete.value.distance, markToDelete.value.unit);
  showDeleteConfirm.value = false;
  markToDelete.value = null;
}

function cancelDelete() {
  showDeleteConfirm.value = false;
  markToDelete.value = null;
}
</script>

<style scoped>
.sight-marks {
  padding: 1rem;
}
.fullscreen-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 1000;
}

.dialog-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.dialog-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.control-group {
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
}

.distance-inputs {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.distance-number {
  font-size: 1.2rem;
  width: 4rem;
  padding: 0.4rem;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.unit-select {
  font-size: 1rem;
  padding: 0.4rem;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.slider-value {
  text-align: center;
  font-size: 1.2rem;
  margin: 0.5rem 0;
}

.vertical-control {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  min-height: 30vh;
}
.vertical-slider {
  width: 0.5rem;
  height: 25vh;
  margin: 1rem 0;
  writing-mode: bt-lr;
  -webkit-appearance: slider-vertical;
}

@media (orientation: portrait) {
  .vertical-slider {
    height: 45vh;
  }
}

/* Add these vendor prefixes for better mobile support */
input[type="range"][orient="vertical"] {
  writing-mode: bt-lr;
  -webkit-appearance: slider-vertical;
}

.dialog-content {
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.dialog-actions {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid #eee;
}
.horizontal-slider {
  width: 100%;
  height: 32px;
}

.dialog-actions {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid #eee;
}

.add-button {
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  margin: 1rem 0;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
}

.primary {
  background: #007AFF;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
}

.secondary {
  background: #f5f5f5;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
}

.marks-list {
  margin-top: 1rem;
}

.mark-card {
  background: white;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mark-distance {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.mark-details {
  color: #666;
  line-height: 1.4;
}
</style>
