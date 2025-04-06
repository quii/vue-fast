import { Distance, Meters } from "../distance/distance";

/**
 * Represents the vertical adjustment on a sight
 */
export interface VerticalAdjustment {
  major: number;
  minor: number;
  micro: number;
}

/**
 * Represents a sight mark with distance and adjustment settings
 */
export interface SightMark {
  distance: Distance;
  notches: number;
  vertical: VerticalAdjustment;
}

/**
 * Internal interface for normalized sight marks used in calculations
 */
interface NormalizedSightMark extends SightMark {
  normalizedDistance: Meters;
  verticalValue: number;
}

/**
 * Calculates an estimated sight mark based on existing sight marks and a target distance
 *
 * @param marks - Array of sight mark objects
 * @param targetDistance - The distance to estimate for
 * @returns The estimated sight mark or null if estimation is not possible
 */
export function estimateSightMark(
  marks: SightMark[],
  targetDistance: Distance
): SightMark | null {
  if (!marks || marks.length < 2) {
    return null;
  }

  // Convert all marks to meters for calculation
  const normalizedMarks: NormalizedSightMark[] = marks.map(mark => {
    // Convert to meters for calculation
    const distanceInMeters = mark.distance.toMeters();

    // Convert vertical to a single number for easier calculation
    const verticalValue = convertVerticalToNumber(mark.vertical);

    return {
      ...mark,
      normalizedDistance: distanceInMeters,
      verticalValue
    };
  });

  // Sort by distance
  normalizedMarks.sort((a, b) =>
    a.normalizedDistance as number - b.normalizedDistance as number
  );

  // Get target distance in meters
  const targetDistanceInMeters = targetDistance.toMeters();

  // Find the two closest marks for interpolation
  let lowerMark: NormalizedSightMark | null = null;
  let upperMark: NormalizedSightMark | null = null;

  for (const mark of normalizedMarks) {
    if ((mark.normalizedDistance as number) <= (targetDistanceInMeters as number)) {
      lowerMark = mark;
    } else {
      upperMark = mark;
      break;
    }
  }

  // If we don't have a lower mark, use the first two
  if (!lowerMark && normalizedMarks.length >= 2) {
    lowerMark = normalizedMarks[0];
    upperMark = normalizedMarks[1];
  }

  // If we don't have an upper mark, use the last two
  if (!upperMark && normalizedMarks.length >= 2) {
    upperMark = normalizedMarks[normalizedMarks.length - 1];
    lowerMark = normalizedMarks[normalizedMarks.length - 2];
  }

  // If we have both marks, interpolate
  if (lowerMark && upperMark) {
    const distanceRange =
      (upperMark.normalizedDistance as number) - (lowerMark.normalizedDistance as number);
    const distanceRatio =
      ((targetDistanceInMeters as number) - (lowerMark.normalizedDistance as number)) / distanceRange;

    // Interpolate vertical value
    const estimatedVerticalValue = Math.round(
      lowerMark.verticalValue + (upperMark.verticalValue - lowerMark.verticalValue) * distanceRatio
    );

    // Convert back to vertical object
    const vertical = convertNumberToVertical(estimatedVerticalValue);

    // Return the estimated mark
    return {
      distance: targetDistance,
      notches: lowerMark.notches, // Just use the notches from the lower mark as a default
      vertical
    };
  }

  return null;
}

/**
 * Converts a vertical adjustment object to a single number
 * e.g., {major: 5, minor: 6, micro: 2} becomes 562
 *
 * @param vertical - The vertical object with major, minor, and micro properties
 * @returns The combined number representation
 */
function convertVerticalToNumber(vertical: VerticalAdjustment): number {
  return vertical.major * 100 + vertical.minor * 10 + vertical.micro;
}

/**
 * Converts a number back to a vertical adjustment object
 * e.g., 562 becomes {major: 5, minor: 6, micro: 2}
 *
 * @param value - The number to convert
 * @returns The vertical object with major, minor, and micro properties
 */
function convertNumberToVertical(value: number): VerticalAdjustment {
  const major = Math.floor(value / 100);
  const minor = Math.floor((value % 100) / 10);
  const micro = value % 10;

  return {
    major,
    minor,
    micro
  };
}

/**
 * Checks if there are enough sight marks to perform estimation
 *
 * @param marks - Array of sight mark objects
 * @returns True if estimation is possible
 */
export function canEstimateSightMark(marks: SightMark[]): boolean {
  if (!marks || marks.length < 2) {
    return false;
  }

  // Get unique distances
  const uniqueDistances = new Set<string>();
  marks.forEach(mark => {
    uniqueDistances.add(mark.distance.toString());
  });

  // We need at least 2 different distances to interpolate
  return uniqueDistances.size >= 2;
}
