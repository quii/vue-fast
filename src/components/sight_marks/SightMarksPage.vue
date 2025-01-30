<template>
  <div class="sight-marks">
    <h1>Sight Marks</h1>
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
          <div class="slider-container">
            <input
              type="range"
              v-model="notchesValue"
              min="0"
              max="15"
              step="1"
              class="horizontal-slider"
            />
          </div>
        </div>

        <div class="vertical-control">
          <label>Height: {{ formatVertical(newMark.vertical) }}</label>
          <div class="vertical-slider-container">
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
        </div>

        <div class="dialog-actions">
          <button class="secondary" @click="showAddMark = false">Cancel</button>
          <button class="primary" @click="saveMark">Save</button>
        </div>
      </div>
    </div>

    <div class="marks-list">
      <div v-for="mark in marks" :key="`${mark.distance}${mark.unit}`" class="mark-card">
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

const showAddMark = ref(false);
const marks = ref([]);
const newMark = ref({
  distance: 20,
  unit: "m",
  notches: 2,
  vertical: {
    major: 5,
    minor: 6,
    micro: 2
  }
});

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
});

const notchesValue = computed({
  get() {
    return 15 - newMark.value.notches;
  },
  set(value) {
    newMark.value.notches = 15 - value;
  }
});

const displayNotches = computed(() => newMark.value.notches);

function formatVertical(vertical) {
  return `${vertical.major}.${vertical.minor}.${vertical.micro}`;
}

function saveMark() {
  marks.value.push({ ...newMark.value });
  showAddMark.value = false;
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

.slider-container {
  position: relative;
  padding: 0.5rem 0;
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  margin-top: 5px;
  color: #666;
  font-size: 0.8rem;
}

.vertical-control {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
}

.vertical-slider-container {
  display: flex;
  align-items: center;
  height: 50vh;
  margin: 1rem 0;
}

.vertical-ticks {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
  margin-right: 10px;
  color: #666;
  font-size: 0.8rem;
  height: 100%;
}

.vertical-slider {
  width: 8px;
  height: 100%;
  writing-mode: bt-lr;
  -webkit-appearance: slider-vertical;
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
