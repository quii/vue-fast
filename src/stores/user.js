import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useUserStore = defineStore("user", () => {
  const state = useLocalStorage("user", {
  });

  function save(ageGroup, gender, bowType, classification, maxYards, name, constructiveCriticism) {
    state.value = {
      ageGroup, gender, bowType, classification, maxYards, name, constructiveCriticism
    };
  }

  return {
    user: state,
    save
  };
});
