import { defineStore } from "pinia";

export const usePreferencesStore = defineStore("preferences", {
  state: () => ({
    hasSeenPrintTip: localStorage.getItem("hasSeenPrintTip") === "true",
    hasSeenHistoryTip: localStorage.getItem('hasSeenHistoryTip') === 'true',
    hasSeenRoundSelectionTip: localStorage.getItem('hasSeenRoundSelectionTip') === 'true',
    hasSeenScoreCardTutorial: localStorage.getItem('hasSeenScoreCardTutorial') === 'true'
  }),
  actions: {
    dismissPrintTip() {
      this.hasSeenPrintTip = true;
      localStorage.setItem("hasSeenPrintTip", "true");
    },
    dismissHistoryTip() {
      this.hasSeenHistoryTip = true;
      localStorage.setItem("hasSeenHistoryTip", "true");
    },
    dismissRoundSelectionTip() {
      this.hasSeenRoundSelectionTip = true
      localStorage.setItem('hasSeenRoundSelectionTip', 'true')
    },
    dismissScoreCardTutorial() {
      this.hasSeenScoreCardTutorial = true
      localStorage.setItem('hasSeenScoreCardTutorial', 'true')
    },
    // New method to reset all preferences
    resetAllTips() {
      this.hasSeenPrintTip = false
      this.hasSeenHistoryTip = false
      this.hasSeenRoundSelectionTip = false
      this.hasSeenScoreCardTutorial = false

      localStorage.removeItem('hasSeenPrintTip')
      localStorage.removeItem('hasSeenHistoryTip')
      localStorage.removeItem('hasSeenRoundSelectionTip')
      localStorage.removeItem('hasSeenScoreCardTutorial')
    }
  }
});
