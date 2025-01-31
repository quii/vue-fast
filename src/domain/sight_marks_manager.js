export class SightMarksManager {
  constructor(storage) {
    this.storage = storage;
  }

  add(distance, unit, notches, vertical) {
    const mark = { distance, unit, notches, vertical };
    this.storage.value.push(mark);
  }

  update(distance, unit, notches, vertical) {
    const index = this.storage.value.findIndex(
      m => m.distance === distance && m.unit === unit
    );
    if (index >= 0) {
      this.storage.value[index] = { distance, unit, notches, vertical };
    }
  }

  delete(distance, unit) {
    this.storage.value = this.storage.value.filter(
      mark => !(mark.distance === distance && mark.unit === unit)
    );
  }

  getAll() {
    return [...this.storage.value].sort((a, b) => {
      const distanceA = convertToMetres(a.distance, a.unit);
      const distanceB = convertToMetres(b.distance, b.unit);
      return distanceA - distanceB;
    });
  }
}

function convertToMetres(distance, unit) {
  return unit === "yd" ? distance * 0.9144 : distance;
}
