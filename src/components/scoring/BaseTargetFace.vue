<script setup>
import { calculateScoreIsValidForEnd } from "@/domain/scoring/end.js";
import { computed } from "vue";
import { ref } from "vue";

const props = defineProps({
  arrows: {
    type: Array,
    default: () => []
  },
  validScores: {
    type: Array,
    required: true
  },
  gameType: {
    type: String,
    required: true
  },
  interactive: {
    type: Boolean,
    default: false
  },
  scores: {
    type: Array,
    default: () => []
  },
  knockColor: {
    type: String,
    default: "#FF69B4"
  }
});

const scale = ref(1);
let initialDistance = 0;

function handleTouchStart(event) {
  if (event.touches.length === 2) {
    initialDistance = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY
    );
  }
}

function handleTouchMove(event) {
  if (event.touches.length === 2) {
    const currentDistance = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY
    );

    const delta = currentDistance / initialDistance;
    scale.value = Math.min(Math.max(1, delta), 3);
  }
}

function isScoreValidForEnd(score) {
  if (!props.interactive) return true;
  return calculateScoreIsValidForEnd(props.scores, props.gameType)(score === "X" ? "X" : Number(score));
}


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
      scale: scaleIncrement * (index + 1)
    };
  }).reverse();
});

const visibleArrows = computed(() =>
  props.arrows.filter(arrow => arrow.position)
);
</script>

<template>
  <div class="target-container"
       @touchstart="handleTouchStart"
       @touchmove="handleTouchMove"
       :style="{ transform: `scale(${scale})`, '--knock-color': knockColor }">
    <div v-for="ring in rings"
         :key="ring.score"
         class="ring"
         :class="[ring.color, { 'invalid-score': !isScoreValidForEnd(ring.score) }]"
         :data-test="`score-${ring.score}`"
         :data-score="ring.score"
         :style="{
           transform: `translate(-50%, -50%) scale(${ring.scale})`,
           zIndex: ring.score === 'X' ? 11 : Number(ring.score)
         }">
    </div>

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
</template>

<style scoped>
.invalid-score {
  background-image: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.3),
    rgba(0, 0, 0, 0.3) 10px,
    rgba(0, 0, 0, 0.5) 10px,
    rgba(0, 0, 0, 0.5) 20px
  );
}

.black.invalid-score {
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.3),
    rgba(255, 255, 255, 0.3) 10px,
    rgba(255, 255, 255, 0.5) 10px,
    rgba(255, 255, 255, 0.5) 20px
  );
}

.target-container {
  position: relative;
  width: 90vmin;
  aspect-ratio: 1;
  margin: 1rem auto;
  touch-action: pinch-zoom;
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
  background-color: var(--knock-color) !important;
  pointer-events: none;
  z-index: 1000;
  border: 1px solid white;
}

.arrow-marker:not(.current) {
  opacity: 0.7;
}
</style>
