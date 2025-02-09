<script setup>
import BaseModal from "@/components/BaseModal.vue";
import { ref, h, createApp } from "vue";
import RoundScores from "@/components/RoundScores.vue";
import ArcherDetails from "@/components/ArcherDetails.vue";
import SaveScoreSheetButton from "@/components/SaveScoreSheetButton.vue";

const props = defineProps(["shoot", "archerName", "endSize", "ageGroup", "gender", "bowType", "gameType", "date"]);
const emit = defineEmits(["close"]);
const targetCaptain = ref("");
const shotAt = ref("");

function print() {
  const formatTitle = (str) => str ? str.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-") : "";
  const title = [
    formatTitle(props.archerName),
    shotAt.value ? formatTitle(shotAt.value) : ""
  ].filter(Boolean).join("-");

  const printWindow = window.open("", "_blank", "");
  const doc = printWindow.document;
  doc.title = title;

  const style = document.createElement("style");
  style.textContent = `
    body { font-family: Arial; padding: 20px; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid black; padding: 8px; text-align: center; text-transform: capitalize; }
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
  <BaseModal>
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
        <SaveScoreSheetButton @click="print" data-test="view-shoot-save2" :disabled="!targetCaptain.trim()" />
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
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
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}
</style>