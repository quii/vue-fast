import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { SightMarksManager } from "@/domain/sight_marks_manager";

export const useSightMarksStore = defineStore("sightMarks", () => {
  const storage = useLocalStorage("sight-marks", []);
  const manager = new SightMarksManager(storage);

  function addMark(distance, unit, notches, vertical) {
    manager.add(distance, unit, notches, vertical);
  }

  function updateMark(distance, unit, notches, vertical) {
    manager.update(distance, unit, notches, vertical);
  }

  function deleteMark(distance, unit) {
    manager.delete(distance, unit);
  }

  function getMarks() {
    return manager.getAll();
  }

  return {
    addMark,
    updateMark,
    deleteMark,
    getMarks
  };
});
