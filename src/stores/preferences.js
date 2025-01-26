import { defineStore } from "pinia";

export const usePreferencesStore = defineStore("preferences", {
  state: () => ({
    hasSeenPrintTip: localStorage.getItem("hasSeenPrintTip") === "true"
  }),
  actions: {
    dismissPrintTip() {
      this.hasSeenPrintTip = true;
      localStorage.setItem("hasSeenPrintTip", "true");
    }
  }
});
