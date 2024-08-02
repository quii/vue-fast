<script setup>
defineProps({
  rounds: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <table>
    <thead>
    <tr>
      <th>Round name</th>
      <th># of dozens</th>
      <th>Max Distance</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="round in rounds" :key="round">
      <td>{{ round.round }}</td>
      <td>{{ round.numberOfEnds }}</td>
      <td>{{ round.distance }}</td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>
td {
  text-transform: capitalize;
}
</style>
