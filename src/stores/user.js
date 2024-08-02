import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useUserStore = defineStore("user", () => {
  const state = useLocalStorage("user", {
  });

  function save(ageGroup, gender, bowType, classification) {
    state.value = {
      ageGroup, gender, bowType, classification
    };
  }

  return {
    user: state,
    save
  };
});
