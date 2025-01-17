<script setup>
import { computed } from "vue";
import { useUserStore } from "@/stores/user";

const user = useUserStore();

const needsBackup = computed(() => user.needsBackup());
</script>

<template>
  <nav>
    <router-link to="/">📝 Scoring</router-link>
    <router-link to="/history">📚 History</router-link>
    <router-link to="/data">💾 Data {{ needsBackup ? "⚠️" : "" }}</router-link>
    <router-link to="/you">👤 You</router-link>
  </nav>
</template>
