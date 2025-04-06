import { gameTypeConfig } from "@/domain/scoring/game_types";

/**
 * Filters game types based on provided criteria
 *
 * @param {Array} types - Array of game type names to filter
 * @param {Object} filters - Filter criteria
 * @param {boolean} filters.showIndoor - Whether to show indoor rounds
 * @param {boolean} filters.showOutdoor - Whether to show outdoor rounds
 * @param {boolean} filters.showMetric - Whether to show metric rounds
 * @param {boolean} filters.showImperial - Whether to show imperial rounds
 * @param {boolean} filters.showPractice - Whether to show practice rounds
 * @param {number} filters.maxDistance - Maximum distance in yards
 * @param {string} [filters.searchQuery] - Optional search query to filter by name
 * @returns {Array} - Filtered array of game type names
 */
export function filterGameTypes(types, filters) {
  // Apply search filter first if provided
  let filteredTypes = types;
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredTypes = types.filter(type =>
      type.toLowerCase().includes(query)
    );
  }

  // Then apply all other filters
  return filteredTypes.filter(type => {
    const config = gameTypeConfig[type.toLowerCase()];

    if (!config) {
      return false; // Skip rounds without config
    }

    // Use the flags directly from the config
    const isOutdoor = config.isOutdoor === true;
    const isIndoor = !isOutdoor;
    const isImperial = config.isImperial === true;
    const isMetric = !isImperial;
    const isPractice = config.isPracticeRound === true;

    // Check if the round's max distance is within the user's max distance
    const roundMaxDistance = config.maxDistanceYards || 0;
    const passesDistanceFilter = roundMaxDistance <= filters.maxDistance;

    // Apply all filters
    const passesEnvironmentFilter = (isIndoor && filters.showIndoor) || (isOutdoor && filters.showOutdoor);
    const passesUnitFilter = (isMetric && filters.showMetric) || (isImperial && filters.showImperial);
    const passesPracticeFilter = filters.showPractice ? isPractice : !isPractice;

    return passesEnvironmentFilter && passesUnitFilter && passesPracticeFilter && passesDistanceFilter;
  });
}
