import {MISS} from "@/domain/scores";
import { baseConfig, imperialPractices, metricPractices } from "@/domain/game_type_config";

const imperialScores = [9, 7, 5, 3, 1, MISS];
const outdoorMetricScores = ["X", 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS];
const indoorMetricScores = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS];

const allRounds = [...baseConfig, ...imperialPractices, ...metricPractices];
export const gameTypeConfig = calculateConfigFromBase(allRounds);
export const gameTypes = Object.keys(gameTypeConfig);

function calculateConfigFromBase(base) {
  const rounds = base.reduce((acc, gameType) => {
    const endSize = calculateEndSize(gameType.endSize);
    const maxArrows = calculateMaxArrows(gameType, endSize);
    return ({
      ...acc, [gameType.name]: {
        distancesRoundSizes: gameType.distancesRoundSizes,
        scores: gameType.scores || calculateScoresForGame(gameType),
        unit: gameType.isImperial ? "yd" : "m",
        endSize: endSize,
        isOutdoor: gameType.isOutdoor,
        maxArrows,
        numberOfEnds: maxArrows / endSize,
        isImperial: gameType.isImperial
      }
    });
  }, {});

  return Object.keys(rounds).sort().reduce(
    (obj, key) => {
      obj[key] = rounds[key];
      return obj;
    },
    {}
  );
}

function calculateMaxArrows(gameType, endSize) {
  return gameType.distancesRoundSizes.reduce((total, roundSize) => {
    return total + roundSize * endSize * 2;
  }, 0);
}

function calculateEndSize(endSize) {
  if (endSize) {
    return endSize;
  }
  return 6;
}

function calculateScoresForGame({ isImperial, isOutdoor }) {
  if (isImperial) {
    return imperialScores;
  }
  if (isOutdoor) {
    return outdoorMetricScores;
  }
  return indoorMetricScores;
}



