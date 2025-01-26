<script setup>
import { ref, h, createApp } from "vue";
import RoundScores from "./RoundScores.vue";
import RoundScoresLandscape from "./RoundScoresLandscape.vue";
import RoundScoresPortrait from "./RoundScoresPortrait.vue";
import ArcherDetails from "@/components/ArcherDetails.vue";

const props = defineProps(["shoot", "archerName", "endSize", "ageGroup", "gender", "bowType", "gameType", "date"]);
const emit = defineEmits(["close"]);
const targetCaptain = ref("");
const shotAt = ref("");

function print() {
  const printWindow = window.open("", "_blank");
  const doc = printWindow.document;

  const style = document.createElement("style");
  style.textContent = `
    body { font-family: Arial; padding: 20px; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid black; padding: 8px; text-align: center; }
    .score { font-weight: bold; }
    .signatures { margin-top: 2em; }
    h1 { text-transform: capitalize; text-align: center; }
    h2 {text-align: center;}
    #classification { display: none; }
  `;

  const container = document.createElement("div");
  const app = createApp({
    render() {
      return h("div", [
        h("h1", `${props.gameType} - ${props.date}`),
        shotAt.value && h("h2", `Shot at ${shotAt.value}`),
        h(ArcherDetails, {
          name: props.archerName,
          ageGroup: props.ageGroup,
          gender: props.gender,
          bowType: props.bowType
        }),
        h(RoundScores, {
          scores: props.shoot.scores,
          gameType: props.shoot.gameType,
          endSize: props.endSize,
          forceLandscape: true
        })
      ]);
    }
  });

  app.component("ArcherDetails", ArcherDetails);
  app.component("RoundScores", RoundScores);
  app.component("RoundScoresLandscape", RoundScoresLandscape);
  app.component("RoundScoresPortrait", RoundScoresPortrait);
  app.mount(container);

  const signatures = document.createElement("div");
  signatures.className = "signatures";
  signatures.innerHTML = `
  <div class="signature-block">
    <div class="signature-row">
      <span>Target Captain: ${targetCaptain.value}</span>
      <div class="signature-line"></div>
    </div>
  </div>

  <div class="signature-block">
    <div class="signature-row">
      <span>Archer: ${props.archerName}</span>
      <div class="signature-line"></div>
    </div>
  </div>
`;

  const signatureStyles = `
  .signatures {
    margin-top: 3em;
    display: flex;
    flex-direction: column;
    gap: 6em;
  }
  .signature-row {
    display: flex;
    align-items: center;
    gap: 1em;
  }
  .signature-line {
    flex-grow: 1;
    border-bottom: 2px dotted black;
    height: 2em;
  }
`;
  style.textContent += signatureStyles;
  doc.head.appendChild(style);
  doc.body.appendChild(container);
  doc.body.appendChild(signatures);
  doc.body.appendChild(document.createElement("script")).textContent = "window.onload = () => window.print()";

  emit("close");
}
</script>
<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>Download Score Sheet 📄</h2>

      <form @submit.prevent="print">
        <div class="form-group">
          <label for="captain">Target Captain's Name</label>
          <input
            id="captain"
            v-model="targetCaptain"
            type="text"
            placeholder="Enter name"
            autofocus
          >
        </div>

        <div class="form-group">
          <label for="location">Shot At</label>
          <input
            id="location"
            v-model="shotAt"
            type="text"
            placeholder="Enter location (optional)"
          >
        </div>

        <div class="button-group">
          <button type="button" @click="emit('close')">Cancel</button>
          <button
            type="submit"
            class="primary"
            :disabled="!targetCaptain.trim()"
          >
            Save Score Sheet 💾
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  min-width: 400px;
  text-align: center;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

button {
  padding: 0.5rem 1rem;
}

button.primary {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}

button.primary:hover {
  background: #45a049;
}

button.primary:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
</style>
