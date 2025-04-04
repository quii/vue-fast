/**
 * Calculates an estimated sight mark based on existing sight marks and a target distance
 *
 * @param {Array} marks - Array of sight mark objects with distance, unit, notches, and vertical properties
 * @param {number} targetDistance - The distance to estimate for
 * @param {string} targetUnit - The unit of the target distance ('m' or 'yd')
 * @returns {Object|null} - The estimated sight mark or null if estimation is not possible
 */
export function estimateSightMark(marks, targetDistance, targetUnit) {
  if (!marks || marks.length < 2) {
    return null;
  }

  // Convert all marks to the same unit for calculation
  const normalizedMarks = marks.map(mark => {
    // Convert to meters for calculation
    const distanceInMeters = mark.unit === "m" ?
      mark.distance :
      mark.distance * 0.9144; // 1 yard = 0.9144 meters

    // Convert vertical to a single number for easier calculation
    const verticalValue = convertVerticalToNumber(mark.vertical);

    return {
      ...mark,
      normalizedDistance: distanceInMeters,
      verticalValue
    };
  });

  // Sort by distance
  normalizedMarks.sort((a, b) => a.normalizedDistance - b.normalizedDistance);

  // Convert target distance to meters
  const targetDistanceInMeters = targetUnit === "m" ?
    targetDistance :
    targetDistance * 0.9144;

  // Find the two closest marks for interpolation
  let lowerMark = null;
  let upperMark = null;

  for (const mark of normalizedMarks) {
    if (mark.normalizedDistance <= targetDistanceInMeters) {
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
    const distanceRange = upperMark.normalizedDistance - lowerMark.normalizedDistance;
    const distanceRatio = (targetDistanceInMeters - lowerMark.normalizedDistance) / distanceRange;

    // Interpolate vertical value
    const estimatedVerticalValue = Math.round(
      lowerMark.verticalValue + (upperMark.verticalValue - lowerMark.verticalValue) * distanceRatio
    );

    // Convert back to vertical object
    const vertical = convertNumberToVertical(estimatedVerticalValue);

    // Return the estimated mark
    return {
      distance: targetDistance,
      unit: targetUnit,
      notches: lowerMark.notches, // Just use the notches from the lower mark as a default
      vertical
    };
  }

  return null;
}

/**
 * Converts a vertical object to a single number
 * e.g., {major: 5, minor: 6, micro: 2} becomes 562
 *
 * @param {Object} vertical - The vertical object with major, minor, and micro properties
 * @returns {number} - The combined number representation
 */
function convertVerticalToNumber(vertical) {
  return vertical.major * 100 + vertical.minor * 10 + vertical.micro;
}

/**
 * Converts a number back to a vertical object
 * e.g., 562 becomes {major: 5, minor: 6, micro: 2}
 *
 * @param {number} value - The number to convert
 * @returns {Object} - The vertical object with major, minor, and micro properties
 */
function convertNumberToVertical(value) {
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
 * @param {Array} marks - Array of sight mark objects
 * @returns {boolean} - True if estimation is possible
 */
export function canEstimateSightMark(marks) {
  if (!marks || marks.length < 2) {
    return false;
  }

  // Get unique distances
  const uniqueDistances = new Set();
  marks.forEach(mark => {
    uniqueDistances.add(`${mark.distance}${mark.unit}`);
  });

  // We need at least 2 different distances to interpolate
  return uniqueDistances.size >= 2;
}
