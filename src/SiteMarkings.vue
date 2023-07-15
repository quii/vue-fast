<script setup>

import { useSightMarkingsStore } from "@/stores/site_markings";
import { ref } from "vue";

const markingStore = useSightMarkingsStore()
const distance = ref(0)
const reading = ref(0)

function addMarking(event) {
  event.preventDefault()
  markingStore.add(distance.value, reading.value)
  distance.value = 0
  reading.value = 0
}
</script>

<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>Distance</th>
          <th>Reading</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="marking in markingStore.markings" :key="marking.id">
          <td>{{ marking.distance }}</td>
          <td>{{ marking.reading }}</td>
          <td><button @click="markingStore.remove(marking.id)">❌</button></td>
        </tr>
      </tbody>
    </table>

    <div>
      <label>Distance <input type="number" id="distance" name="distance" min="20" max="100" step="10" v-model="distance" list="distances" />
      </label>
      <label>Reading <input type="text" id="reading" name="reading" v-model="reading" /></label>
      <button @click="addMarking">Add</button>
    </div>
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1em;
}

input {
  font-size: 1.5em;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

button {
  font-size: 1.5em;
  padding: 0.5em;
}
</style>
