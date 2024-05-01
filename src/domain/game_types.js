import {MISS} from "@/domain/scores";
import {baseConfig} from "@/domain/game_type_config";

const imperialScores = [9, 7, 5, 3, 1, MISS];
const outdoorMetricScores = ["X", 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS];
const indoorMetricScores = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS];

export const gameTypeConfig = calculateConfigFromBase(baseConfig);
export const gameTypes = Object.keys(gameTypeConfig);

function calculateConfigFromBase(base) {
  return base.reduce((acc, gameType) => {
    const endSize = calculateEndSize(gameType.endSize, gameType.isOutdoor);
    return ({
      ...acc, [gameType.name]: {
        distancesRoundSizes: gameType.distancesRoundSizes,
        scores: gameType.scores || calculateScoresForGame(gameType),
        unit: gameType.isImperial ? "yd" : "m",
        endSize: endSize,
        isOutdoor: gameType.isOutdoor,
        maxArrows: calculateMaxArrows(gameType, endSize)
      }
    });
  }, {});
}

function calculateMaxArrows(gameType, endSize) {
  return gameType.distancesRoundSizes.reduce((total, roundSize) => {
    return total + roundSize * endSize * 2;
  }, 0);
}

function calculateEndSize(endSize, isOutdoor) {
  if (endSize) {
    return endSize;
  }
  return isOutdoor ? 6 : 3;
}

function calculateScoresForGame({ isImperial, isOutdoor }) {
  let scores = imperialScores;
  if (!isImperial && isOutdoor) {
    scores = outdoorMetricScores;
  }
  if (!isImperial && !isOutdoor) {
    scores = indoorMetricScores;
  }
  return scores;
}



