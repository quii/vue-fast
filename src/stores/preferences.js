import { defineStore } from "pinia";

export const usePreferencesStore = defineStore("preferences", {
  state: () => ({
    hasSeenPrintTip: localStorage.getItem("hasSeenPrintTip") === "true",
    hasSeenHistoryTip: localStorage.getItem("hasSeenHistoryTip") === "true"
  }),
  actions: {
    dismissPrintTip() {
      this.hasSeenPrintTip = true;
      localStorage.setItem("hasSeenPrintTip", "true");
    },
    dismissHistoryTip() {
      this.hasSeenHistoryTip = true;
      localStorage.setItem("hasSeenHistoryTip", "true");
    }
  }
});
