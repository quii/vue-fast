import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { SightMarksManager } from "@/domain/repositories/sight_marks_manager.js";

export const useSightMarksStore = defineStore("sight_marks", () => {
  const sightMarks = useLocalStorage("sight-marks", []);
  const manager = new SightMarksManager(sightMarks);

  function addMark(distance, unit, notches, vertical, label) {
    manager.add(distance, unit, notches, vertical, label);
  }

  function updateMark(id, distance, unit, notches, vertical, label) {
    manager.update(id, distance, unit, notches, vertical, label);
  }

  function deleteMark(id) {
    manager.delete(id);
  }

  function togglePriority(distance, unit) {
    manager.togglePriority(distance, unit);
  }

  function findMarksForDistance(distanceMetres, distanceYards) {
    return manager.findMarksForDistance(distanceMetres, distanceYards);
  }

  function getMarks() {
    return manager.getAll();
  }

  // New method to get backup data
  function getBackupData() {
    return getMarks() // Simply return all marks
  }

  // New method to restore from backup
  function restoreFromBackup(backupData) {
    if (!Array.isArray(backupData)) return

    // Clear existing marks first
    const currentMarks = getMarks()
    currentMarks.forEach(mark => {
      if (mark.id !== undefined) {
        deleteMark(mark.id)
      }
    })

    // Add the backed up marks
    backupData.forEach(mark => {
      if (mark.distance && mark.unit && mark.notches !== undefined) {
        addMark(
          mark.distance,
          mark.unit,
          mark.notches,
          mark.vertical || 0,
          mark.label || ''
        )
      }
    })
  }

  return {
    addMark,
    updateMark,
    deleteMark,
    togglePriority,
    findMarksForDistance,
    getMarks,
    getBackupData,     // Export the new backup method
    restoreFromBackup  // Export the new restore method
  };
})
