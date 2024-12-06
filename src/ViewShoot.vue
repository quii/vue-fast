<script setup>
import { useRoute } from "vue-router";
import { useHistoryStore } from "@/stores/history";
import { gameTypeConfig } from "@/domain/game_types";
import { computed } from "vue";
import RoundScores from "@/components/RoundScores.vue";
import { useUserStore } from "@/stores/user";
import html2pdf from "html2pdf.js";

const route = useRoute();
const history = useHistoryStore();
const userStore = useUserStore();

history.setShootToView(route.params.id);

const endSize = computed(() => gameTypeConfig[history.selectedShoot.gameType].endSize);
const scores = computed(() => history.selectedShoot.scores);
const gameType = computed(() => history.selectedShoot.gameType);
const date = computed(() => history.selectedShoot.date);

function convertToPDF() {
  const style = document.createElement("style");
  style.textContent = `
  body { background: #fff; color: #000; }
  #classification { display:none;}
  input[type="text"] {border:none; background-color:white; color: #000;}
  `;

  const element = document.querySelector("#scores").cloneNode(true);
  element.append(style);
  const opt = {
    margin: 1,
    filename: `${gameType.value}-${date.value}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    mode: ["avoid-all"]
  };

  html2pdf().set(opt).from(element).save();
}
</script>

<template>
  <div id="scores">

    <h1>{{ gameType }} - {{ date }}</h1>
    <table class="details">
      <thead>
      <tr>
        <th>Name</th>
        <th>Age group</th>
        <th>Gender</th>
        <th>Bow type</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td>{{ userStore.user.name }}</td>
        <td>{{ userStore.user.ageGroup }}</td>
        <td>{{ userStore.user.gender }}</td>
        <td>{{ userStore.user.bowType }}</td>
      </tr>
      </tbody>
    </table>
    <RoundScores :scores="scores"
                 :end-size="endSize"
                 :game-type="gameType" />

    <div class="signatures">
      <p class="signature">.........................................................</p>
      <h3>Archer's signature: {{ userStore.user.name }}</h3>
      <p class="signature">.........................................................</p>
      <h3>Target Captain: <input type="text" placeholder="Put name here"></h3>
    </div>

  </div>
  <button @click="convertToPDF">💾 Download score sheet</button>


</template>

<style scoped>
h1 {
  text-transform: capitalize;
  text-align: center;
}

.details {
  text-transform: capitalize;
}

.signatures {
  padding: 1em 0 1em 1em;
}

.signatures p {
  padding-top: 5em;
}

.signatures input {
  height: 1.8em;
  padding-left: 1em;
  border: none;
}

button {
  margin-left: 1em;
  font-size: 1em;
}
</style>
