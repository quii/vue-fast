import { defineStore } from "pinia";
import { ref } from "vue";
import { SightMarksManager } from "@/domain/sight_marks_manager";

export const useSightMarksStore = defineStore("sight_marks", () => {
  const sightMarks = ref([]);
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

  function getMarks() {
    return manager.getAll();
  }

  return { addMark, updateMark, deleteMark, togglePriority, getMarks };
})