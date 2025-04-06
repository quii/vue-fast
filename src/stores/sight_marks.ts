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

  return {
    addMark,
    updateMark,
    deleteMark,
    togglePriority,
    findMarksForDistance,
    getMarks
  };
})
