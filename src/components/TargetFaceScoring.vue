<script setup>
import { computed } from "vue";
import { calculateScoreIsValidForEnd } from "@/domain/scoring/end";

const emit = defineEmits(["score", "undo"]);

const props = defineProps({
  arrows: {
    type: Array,
    default: () => []
  },
  currentEnd: {
    type: Number,
    required: true
  },
  scores: {
    type: Array,
    required: true
  },
  gameType: {
    type: String,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false
  },
  validScores: {
    type: Array,
    required: true
  }
});

const rings = computed(() => {
  const validRingScores = props.validScores.filter(score => score !== "M");
  const scaleIncrement = 1 / validRingScores.length;

  return validRingScores.map((score, index) => {
    let color;
    if (props.gameType === "worcester") {
      color = score === 5 ? "white" : "black";
    } else {
      if (score === "X" || score >= 9) color = "gold";
      else if (score >= 7) color = "red";
      else if (score >= 5) color = "blue";
      else if (score >= 3) color = "black";
      else color = "white";
    }

    return {
      score,
      color,
      scale: scaleIncrement * (index + 1),
      isX: score === "X"
    };
  }).reverse();
});

const visibleArrows = computed(() =>
  props.arrows.filter(arrow => arrow.position)
);
</script>

<template>
  <div class="target-container" @click="(e) => {
    if (props.readonly) return;
    const score = e.target.dataset.score === 'X' ? 'X' : Number(e.target.dataset.score)

    if (calculateScoreIsValidForEnd(props.scores, props.gameType)(score)) {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      emit('score', { score, position, end: props.currentEnd });
    }
  }">
    <div v-for="ring in rings"
         :key="ring.score"
         class="ring"
         :class="[
           ring.color,
           {
             disabled: !props.readonly && !calculateScoreIsValidForEnd(props.scores, props.gameType)(ring.score)
           }
         ]"
         :data-score="ring.score"
         :style="{ transform: `translate(-50%, -50%) scale(${ring.scale})` }">
    </div>
    <!-- Arrow markers -->
    <div v-for="arrow in visibleArrows"
         :key="arrow.id"
         class="arrow-marker"
         :class="{ current: arrow.end === props.currentEnd }"
         :style="{
         left: `${arrow.position.x}px`,
         top: `${arrow.position.y}px`
       }">
    </div>
  </div>
  <div class="controls">
    <button
      class="miss"
      :disabled="props.readonly || !calculateScoreIsValidForEnd(props.scores, props.gameType)('M')"
      @click="$emit('score', { score: 'M', position: null, end: props.currentEnd })">
      Miss
    </button>
    <button
      class="undo"
      :disabled="props.readonly"
      @click="$emit('undo')">
      ⌫
    </button>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.controls button {
  flex: 1;
  padding: 1rem;
  font-size: 1.2rem;
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ring.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.target-container {
  position: relative;
  width: 90vmin;
  aspect-ratio: 1;
  margin: 0 auto;
}

.ring {
  position: absolute;
  border-radius: 50%;
  width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid black;
  cursor: pointer;
}

.ring:nth-child(10) {
  transform: translate(-50%, -50%) scale(1);
}

/* white (1) */
.ring:nth-child(9) {
  transform: translate(-50%, -50%) scale(0.9);
}

/* white (2) */
.ring:nth-child(8) {
  transform: translate(-50%, -50%) scale(0.8);
}

/* black (3) */
.ring:nth-child(7) {
  transform: translate(-50%, -50%) scale(0.7);
}

/* black (4) */
.ring:nth-child(6) {
  transform: translate(-50%, -50%) scale(0.6);
}

/* blue (5) */
.ring:nth-child(5) {
  transform: translate(-50%, -50%) scale(0.5);
}

/* blue (6) */
.ring:nth-child(4) {
  transform: translate(-50%, -50%) scale(0.4);
}

/* red (7) */
.ring:nth-child(3) {
  transform: translate(-50%, -50%) scale(0.3);
}

/* red (8) */
.ring:nth-child(2) {
  transform: translate(-50%, -50%) scale(0.2);
}

/* gold (9) */
.ring:nth-child(1) {
  transform: translate(-50%, -50%) scale(0.1);
}

/* gold (10) */

.gold {
  background-color: gold;
}

.red {
  background-color: red;
}

.blue {
  background-color: blue;
}

.black {
  background-color: black;
  border: 1px solid white;
}

.white {
  background-color: white;
  border: 1px solid black;
}

.arrow-marker {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1000; /* Add this to ensure arrows appear on top */
}

.arrow-marker.current {
  background: #4CAF50;
  opacity: 1;
}

.arrow-marker:not(.current) {
  background: #666;
  opacity: 0.5;
}
</style>
