import { gameTypeConfig } from "@/domain/scoring/game_types";

export interface GameTypeFilters {
  showIndoor: boolean;
  showOutdoor: boolean;
  showMetric: boolean;
  showImperial: boolean;
  showPractice: boolean;
  maxDistance: number;
  searchQuery?: string;
}

//todo: maybe we shouldn't be asking the vue to pass in game types. This belongs to the domain.
export function filterGameTypes(types: string[], filters: GameTypeFilters): string[] {
  // Apply search filter first if provided
  let filteredTypes = types;
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredTypes = types.filter(type =>
      type.toLowerCase().includes(query)
    );
  }

  return filteredTypes.filter(type => {
    const { isOutdoor, isImperial, isPracticeRound, maxDistanceYards } = gameTypeConfig[type.toLowerCase()];

    // Check if the round's max distance is within the user's max distance
    const passesDistanceFilter = maxDistanceYards <= filters.maxDistance;
    const passesEnvironmentFilter = (!isOutdoor && filters.showIndoor) || (isOutdoor && filters.showOutdoor);
    const passesUnitFilter = (!isImperial && filters.showMetric) || (isImperial && filters.showImperial);
    const passesPracticeFilter = filters.showPractice ? isPracticeRound : !isPracticeRound;

    return passesEnvironmentFilter && passesUnitFilter && passesPracticeFilter && passesDistanceFilter;
  });
}
