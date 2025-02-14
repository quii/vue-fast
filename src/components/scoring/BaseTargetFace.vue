<script setup>
import { computed } from "vue";

const props = defineProps({
  arrows: {
    type: Array,
    default: () => []
  },
  currentEnd: {
    type: Number,
    required: true
  },
  validScores: {
    type: Array,
    required: true
  },
  gameType: {
    type: String,
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
      scale: scaleIncrement * (index + 1)
    };
  }).reverse();
});

const visibleArrows = computed(() =>
  props.arrows.filter(arrow => arrow.position)
);
</script>

<template>
  <div class="target-container">
    <div v-for="ring in rings"
         :key="ring.score"
         class="ring"
         :class="ring.color"
         :data-score="ring.score"
         :style="{ transform: `translate(-50%, -50%) scale(${ring.scale})` }">
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
  pointer-events: none;
  z-index: 1000;
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
