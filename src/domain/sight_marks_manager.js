export class SightMarksManager {
  constructor(storage) {
    this.storage = storage;
  }

  add(distance, unit, notches, vertical) {
    const mark = { distance, unit, notches, vertical, priority: false };
    this.storage.value.push(mark);
  }

  update(distance, unit, notches, vertical) {
    const index = this.storage.value.findIndex(
      m => m.distance === distance && m.unit === unit
    );
    if (index >= 0) {
      const currentPriority = this.storage.value[index].priority;
      this.storage.value[index] = { distance, unit, notches, vertical, priority: currentPriority };
    }
  }

  togglePriority(distance, unit) {
    const index = this.storage.value.findIndex(
      m => m.distance === distance && m.unit === unit
    );
    if (index >= 0) {
      this.storage.value[index].priority = !this.storage.value[index].priority;
    }
  }

  delete(distance, unit) {
    this.storage.value = this.storage.value.filter(
      mark => !(mark.distance === distance && mark.unit === unit)
    );
  }

  getAll() {
    return [...this.storage.value].sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority ? 1 : -1;
      }
      const distanceA = convertToMetres(a.distance, a.unit);
      const distanceB = convertToMetres(b.distance, b.unit);
      return distanceA - distanceB;
    });
  }
}
function convertToMetres(distance, unit) {
  return unit === "yd" ? distance * 0.9144 : distance;
}
