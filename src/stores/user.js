import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useUserStore = defineStore("user", () => {
  const state = useLocalStorage("user", {
  });

  function save(ageGroup, gender, bowType, classification, maxYards, name) {
    state.value = {
      ageGroup, gender, bowType, classification, maxYards, name
    };
  }

  return {
    user: state,
    save
  };
});
