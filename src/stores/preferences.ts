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
    },
    // New method to get all preferences for backup
    getBackupData() {
      // Return a copy of the state to avoid reference issues
      return {
        hasSeenPrintTip: this.hasSeenPrintTip,
        hasSeenHistoryTip: this.hasSeenHistoryTip,
        hasSeenRoundSelectionTip: this.hasSeenRoundSelectionTip,
        hasSeenScoreCardTutorial: this.hasSeenScoreCardTutorial
      }
    },
    // New method to restore preferences from backup
    restoreFromBackup(backupData) {
      if (!backupData) return

      // For each preference in the backup, set it if it's true
      if (backupData.hasSeenPrintTip) {
        this.dismissPrintTip()
      }

      if (backupData.hasSeenHistoryTip) {
        this.dismissHistoryTip()
      }

      if (backupData.hasSeenRoundSelectionTip) {
        this.dismissRoundSelectionTip()
      }

      if (backupData.hasSeenScoreCardTutorial) {
        this.dismissScoreCardTutorial()
      }
    }
  }
});
