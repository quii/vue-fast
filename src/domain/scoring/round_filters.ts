import { gameTypeConfig, GameTypeConfig } from "@/domain/scoring/game_types";

export interface GameTypeFilters {
  showIndoor: boolean;
  showOutdoor: boolean;
  showMetric: boolean;
  showImperial: boolean;
  showPractice: boolean;
  maxDistance: number;
  minDistance: number;
  searchQuery?: string;
}

export type RoundFilterConfig = Record<string, Pick<GameTypeConfig, "isOutdoor" | "isImperial" | "isPracticeRound" | "maxDistanceYards">>;

export function createRoundFilter(config: RoundFilterConfig = gameTypeConfig) {
  return function filterRounds(roundNames: string[], filters: GameTypeFilters): string[] {
    let filteredTypes = filters.searchQuery ? filterByName(roundNames, filters.searchQuery) : roundNames;

    return filteredTypes.filter(type => {
      const { isOutdoor, isImperial, isPracticeRound, maxDistanceYards } = config[type.toLowerCase()];

      const passesMaxDistanceFilter = maxDistanceYards <= filters.maxDistance;
      const passesMinDistanceFilter = maxDistanceYards >= filters.minDistance;
      const passesDistanceFilter = passesMaxDistanceFilter && passesMinDistanceFilter;
      const passesEnvironmentFilter = (!isOutdoor && filters.showIndoor) || (isOutdoor && filters.showOutdoor);
      const passesUnitFilter = (!isImperial && filters.showMetric) || (isImperial && filters.showImperial);
      const passesPracticeFilter = filters.showPractice ? isPracticeRound : !isPracticeRound;

      return passesEnvironmentFilter && passesUnitFilter && passesPracticeFilter && passesDistanceFilter;
    });
  };
}

function filterByName(types: string[], filter: string) {
  const query = filter.toLowerCase();
  return types.filter(type =>
    type.toLowerCase().includes(query)
  );
}

export const filterRounds = createRoundFilter();
