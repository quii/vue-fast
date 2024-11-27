<script setup>
import { useRoute } from "vue-router";
import { useHistoryStore } from "@/stores/history";
import { gameTypeConfig } from "@/domain/game_types";
import { computed } from "vue";
import RoundScores from "@/components/RoundScores.vue";
import { useUserStore } from "@/stores/user";

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
  body { background: #fff; color: #000; border:1px solid red; height:100% }
  #classification { display:none;}
  `;
  document.head.appendChild(style);

  const element = document.querySelector("#scores");
  const opt = {
    margin: 1,
    filename: `${gameType.value}-${date.value}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    // html2canvas:  { scale: 2 },
    // jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' },
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

    <!--    cant get below to render in the pdf for some reason-->
    <!--    <div>-->
    <!--    <h2>Archer's signature</h2>-->
    <!--    <p class="signature">.........................................................</p>-->
    <!--    <p>{{userStore.user.name}}</p>-->
    <!--    <h2>Target Captain</h2>-->
    <!--    <p class="signature">.........................................................</p>-->
    <!--    <input type="text" placeholder="Put name here">-->
    <!--    </div>-->

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

.signature {
  padding-top: 2em;
}
</style>
