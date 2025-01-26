<script setup>
defineProps(["name", "ageGroup", "gender", "bowType"]);
</script>

<template>
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
      <td>{{ name }}</td>
      <td>{{ ageGroup }}</td>
      <td>{{ gender }}</td>
      <td>{{ bowType }}</td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>
.details {
  text-transform: capitalize;
}
</style>
