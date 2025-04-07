export class SightMarksManager {
  constructor(storage) {
    this.storage = storage;
    this.migrateExistingData();
  }

  migrateExistingData() {
    this.storage.value = this.storage.value.map(mark => {
      if (!mark.id) {
        mark.id = generateId();
      }
      if (!mark.label) {
        mark.label = "";
      }
      return mark;
    });
  }

  add(distance, unit, notches, vertical, label = "") {
    const mark = {
      id: generateId(),
      distance,
      unit,
      notches,
      vertical: { ...vertical }, // Create a shallow copy of the vertical object
      priority: false,
      label
    };
    this.storage.value = [...this.storage.value, mark];
  }

  update(id, distance, unit, notches, vertical, label) {
    const index = this.storage.value.findIndex(m => m.id === id);
    if (index >= 0) {
      const currentPriority = this.storage.value[index].priority;
      this.storage.value[index] = {
        id,
        distance,
        unit,
        notches,
        vertical,
        priority: currentPriority,
        label
      };
    }
  }

  findMarksForDistance(distanceMetres, distanceYards) {
    const marks = this.getAll();
    return marks.filter(mark =>
      (mark.unit === "m" && mark.distance === distanceMetres) ||
      (mark.unit === "yd" && mark.distance === distanceYards)
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

  togglePriority(distance, unit) {
    const index = this.storage.value.findIndex(
      m => m.distance === distance && m.unit === unit
    );
    if (index >= 0) {
      this.storage.value[index].priority = !this.storage.value[index].priority;
    }
  }

  delete(id) {
    this.storage.value = this.storage.value.filter(mark => mark.id !== id);
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function convertToMetres(distance, unit) {
  return unit === "yd" ? distance * 0.9144 : distance;
}