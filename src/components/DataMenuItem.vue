<script setup>
import { computed } from "vue";
import { useUserStore } from "@/stores/user";

const user = useUserStore();
const needsBackup = computed(() => user.needsBackup());
</script>

<template>
  <span>Data {{ needsBackup ? "⚠️" : "" }}</span>
</template>
