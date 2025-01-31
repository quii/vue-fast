import { defineStore } from "pinia";

import { useLocalStorage } from "@vueuse/core";
import { SightMarksManager } from "../domain/storage/sight_marks_manager.js";

export const useSightMarksStore = defineStore("sight_marks", () => {
  const sightMarks = useLocalStorage("sight-marks", []);
  const manager = new SightMarksManager(sightMarks);

  function addMark(distance, unit, notches, vertical) {
    manager.add(distance, unit, notches, vertical);
  }

  function updateMark(distance, unit, notches, vertical) {
    manager.update(distance, unit, notches, vertical);
  }

  function deleteMark(distance, unit) {
    manager.delete(distance, unit);
  }

  function togglePriority(distance, unit) {
    manager.togglePriority(distance, unit);
  }

  function findMarkForDistance(distanceMetres, distanceYards) {
    return manager.findMarkForDistance(distanceMetres, distanceYards);
  }

  function getMarks() {
    return manager.getAll();
  }

  return {
    addMark,
    updateMark,
    deleteMark,
    togglePriority,
    findMarkForDistance,
    getMarks
  };
})