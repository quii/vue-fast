<script setup>
import { calculateScoreIsValidForEnd } from "@/domain/scoring/end";
import BaseTargetFace from "./BaseTargetFace.vue";

const emit = defineEmits(["score", "undo"]);

const props = defineProps({
  arrows: {
    type: Array,
    default: () => []
  },
  scores: {
    type: Array,
    required: true
  },
  gameType: {
    type: String,
    required: true
  },
  validScores: {
    type: Array,
    required: true
  },
  maxReached: {
    type: Boolean,
    required: true
  }
});

function handleScore(event) {
  if (props.maxReached) return;

  if (event.target.classList.contains("invalid-score")) {
    return;
  }

  const rect = event.currentTarget.getBoundingClientRect();
  const scale = event.currentTarget.style.transform.match(/scale\((.*?)\)/)?.[1] || 1;

  const position = {
    x: (event.clientX - rect.left) / scale,
    y: (event.clientY - rect.top) / scale
  };

  const score = event.target.dataset.score === "X" ? "X" : Number(event.target.dataset.score);
  emit("score", { score, position });
}

</script>

<template>
  <div>
    <BaseTargetFace
      :arrows="arrows"
      :valid-scores="validScores"
      :game-type="gameType"
      :scores="scores"
      :interactive="true"
      @click="handleScore"
    >
    </BaseTargetFace>

    <div class="controls">
      <button
        class="miss"
        data-test="score-M"
        :disabled="maxReached || !calculateScoreIsValidForEnd(scores, gameType)('M')"
        @click="emit('score', { score: 'M', position: null, end: currentEnd })">
        Miss
      </button>
      <button
        class="undo"
        data-test="undo"
        :disabled="maxReached"
        @click="emit('undo')">
        ⌫
      </button>
    </div>
  </div>
</template>


<style scoped>
.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem auto;
}

.controls button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 4px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  cursor: pointer;
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.miss:not(:disabled):hover {
  background: #ff4444;
  color: white;
}

.undo:not(:disabled):hover {
  background: #4CAF50;
  color: white;
}

.invalid-score {
  background-image: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.1) 10px,
    rgba(0, 0, 0, 0.2) 10px,
    rgba(0, 0, 0, 0.2) 20px
  );
  pointer-events: none;
  opacity: 0.7;
}
</style>
