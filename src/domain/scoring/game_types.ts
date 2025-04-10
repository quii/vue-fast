import { baseConfig, imperialPractices, metricPractices, MISS } from "@/domain/scoring/game_type_config";
import { meters, toMeters, toYards, yards } from "@/domain/distance/distance";

//todo: these types feel pretty meaningless if its all nullable. We can do better modelling of some of the fields around outDoor, isImperial etc.
export interface GameTypeBase {
  name: string;
  distancesRoundSizes?: number[];
  isImperial?: boolean;
  isOutdoor?: boolean;
  endSize?: number;
  scores?: (number | string)[];
  maxDistanceYards?: number;
  maxDistanceMetres?: number;
  otherDistancesYards?: number[];
  otherDistancesMetres?: number[];
}

export interface GameTypeConfig {
  name: string;
  distancesRoundSizes?: number[];
  scores: (number | string)[];
  unit: string;
  endSize: number;
  isOutdoor: boolean;
  maxArrows: number;
  canSaveAnytime: boolean;
  isPracticeRound: boolean;
  numberOfEnds: number;
  isImperial: boolean;
  maxDistanceMetres: number;
  maxDistanceYards: number;
  //these two fields probably shouldn't be nullable, just have empty arrays
  otherDistancesYards?: number[];
  otherDistancesMetres?: number[];
}

type GameTypeConfigs = Record<string, GameTypeConfig>;

const imperialScores: (number | string)[] = [9, 7, 5, 3, 1, MISS];
const outdoorMetricScores: (number | string)[] = ["X", 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS];
const indoorMetricScores: (number | string)[] = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS];

const allRounds: GameTypeBase[] = [...baseConfig, ...imperialPractices, ...metricPractices];
export const gameTypeConfig: GameTypeConfigs = calculateConfigFromBase(allRounds);
export const gameTypes: string[] = Object.keys(gameTypeConfig);

function calculateConfigFromBase(base: GameTypeBase[]): GameTypeConfigs {
  const rounds = base.reduce<Record<string, GameTypeConfig>>((acc, gameType) => {
    const endSize: number = calculateEndSize(gameType.endSize);
    const isPracticeRound: boolean = !gameType.distancesRoundSizes ||
      (gameType.distancesRoundSizes.length === 1 &&
        gameType.distancesRoundSizes[0] === 100);

    const maxArrows: number = isPracticeRound ? Infinity : calculateMaxArrows(gameType, endSize);
    const canSaveAnytime: boolean = isPracticeRound;

    const maxDistanceMetres: number = gameType.maxDistanceMetres ||
      (gameType.maxDistanceYards ? toMeters(yards(gameType.maxDistanceYards)) : 0);

    const maxDistanceYards: number = gameType.maxDistanceYards ||
      (gameType.maxDistanceMetres ? toYards(meters(gameType.maxDistanceMetres)) : 0);

    return ({
      ...acc, [gameType.name]: {
        name: gameType.name,
        distancesRoundSizes: gameType.distancesRoundSizes,
        scores: gameType.scores || calculateScoresForGame(gameType),
        unit: gameType.isImperial ? "yd" : "m",
        endSize: endSize,
        isOutdoor: !!gameType.isOutdoor,
        maxArrows,
        canSaveAnytime,
        isPracticeRound,
        numberOfEnds: maxArrows / endSize,
        isImperial: !!gameType.isImperial,
        maxDistanceMetres,
        maxDistanceYards,
        otherDistancesYards: gameType.otherDistancesYards,
        otherDistancesMetres: gameType.otherDistancesMetres
      }
    });
  }, {});

  return Object.keys(rounds).sort().reduce<GameTypeConfigs>(
    (obj, key) => {
      obj[key] = rounds[key];
      return obj;
    },
    {}
  );
}

function calculateMaxArrows(gameType: GameTypeBase, endSize: number): number {
  return gameType.distancesRoundSizes?.reduce((total, roundSize) => {
    return total + roundSize * endSize * 2;
  }, 0) ?? Infinity
}

function calculateEndSize(endSize?: number): number {
  if (endSize) {
    return endSize;
  }
  return 6;
}

function calculateScoresForGame({ isImperial, isOutdoor }: {
  isImperial?: boolean,
  isOutdoor?: boolean
}): (number | string)[] {
  if (isImperial) {
    return imperialScores;
  }
  if (isOutdoor) {
    return outdoorMetricScores;
  }
  return indoorMetricScores;
}
