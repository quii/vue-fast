/**
 * Branded type for meters
 */
export type Meters = number & { readonly __brand: unique symbol };

/**
 * Branded type for yards
 */
export type Yards = number & { readonly __brand: unique symbol };

/**
 * Conversion factor from yards to meters
 */
export const YARDS_TO_METERS = 0.9144;

/**
 * Conversion factor from meters to yards
 */
export const METERS_TO_YARDS = 1 / YARDS_TO_METERS;

/**
 * Creates a Meters value
 */
export function meters(value: number): Meters {
  return value as Meters;
}

/**
 * Creates a Yards value
 */
export function yards(value: number): Yards {
  return value as Yards;
}

/**
 * Converts yards to meters
 */
export function toMeters(yards: Yards): Meters {
  return (yards * YARDS_TO_METERS) as Meters;
}

/**
 * Converts meters to yards
 */
export function toYards(meters: Meters): Yards {
  return (meters * METERS_TO_YARDS) as Yards;
}

/**
 * Represents a distance with a specific unit
 */
export class Distance {
  private constructor(
    private readonly value: number,
    private readonly unit: "meters" | "yards"
  ) {
  }

  /**
   * Creates a distance in meters
   */
  static meters(value: number): Distance {
    return new Distance(value, "meters");
  }

  /**
   * Creates a distance in yards
   */
  static yards(value: number): Distance {
    return new Distance(value, "yards");
  }

  /**
   * Gets the value in meters
   */
  toMeters(): Meters {
    if (this.unit === "meters") {
      return this.value as Meters;
    }
    return toMeters(this.value as Yards);
  }

  /**
   * Gets the value in yards
   */
  toYards(): Yards {
    if (this.unit === "yards") {
      return this.value as Yards;
    }
    return toYards(this.value as Meters);
  }

  /**
   * Gets the raw value in the original unit
   */
  getValue(): number {
    return this.value;
  }

  /**
   * Gets the unit of this distance
   */
  getUnit(): "meters" | "yards" {
    return this.unit;
  }

  /**
   * Returns a formatted string representation
   */
  toString(): string {
    const unitShort = this.unit === "meters" ? "m" : "yd";
    return `${this.value}${unitShort}`;
  }

  /**
   * Parses a formatted distance string
   */
  static parse(formattedDistance: string): Distance | null {
    const match = formattedDistance.match(/^(\d+(?:\.\d+)?)(m|yd)$/);
    if (!match) {
      return null;
    }

    const value = parseFloat(match[1]);
    const unit = match[2];

    return unit === "m"
      ? Distance.meters(value)
      : Distance.yards(value);
  }
}
