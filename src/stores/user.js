import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useUserStore = defineStore("history", () => {
  const state = useLocalStorage("user", {
    ageGroup: "senior",
    gender: "male",
    bowType: "recurve"
  });

  function save(ageGroup, gender, bowType) {
    state.value = {
      ageGroup, gender, bowType
    };
  }

  return {
    user: state,
    save
  };
});
