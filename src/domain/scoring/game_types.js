import { baseConfig, imperialPractices, metricPractices, MISS } from "@/domain/scoring/game_type_config";
import { calculateRoundScores } from "@/domain/scoring/classification";
import { classificationList } from "@/domain/scoring/classificationList";

const imperialScores = [9, 7, 5, 3, 1, MISS];
const outdoorMetricScores = ["X", 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS];
const indoorMetricScores = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS];

const allRounds = [...baseConfig, ...imperialPractices, ...metricPractices];
export const gameTypeConfig = calculateConfigFromBase(allRounds);
export const gameTypes = Object.keys(gameTypeConfig);

function convertToMeters(yards) {
  return yards / 1.094;
}

function convertToYards(metres) {
  return metres * 1.094;
}

function calculateConfigFromBase(base) {
  const rounds = base.reduce((acc, gameType) => {
    const endSize = calculateEndSize(gameType.endSize);
    const isPracticeRound = !gameType.distancesRoundSizes ||
      (gameType.distancesRoundSizes.length === 1 &&
        gameType.distancesRoundSizes[0] === 100);

    const maxArrows = isPracticeRound ?
      Infinity :
      calculateMaxArrows(gameType, endSize);

    const canSaveAnytime = isPracticeRound;

    return ({
      ...acc, [gameType.name]: {
        distancesRoundSizes: gameType.distancesRoundSizes,
        scores: gameType.scores || calculateScoresForGame(gameType),
        unit: gameType.isImperial ? "yd" : "m",
        endSize: endSize,
        isOutdoor: gameType.isOutdoor,
        maxArrows,
        canSaveAnytime,
        isPracticeRound,
        numberOfEnds: maxArrows / endSize,
        isImperial: gameType.isImperial,
        maxDistanceMetres: gameType.maxDistanceMetres || convertToMeters(gameType.maxDistanceYards),
        maxDistanceYards: gameType.maxDistanceYards || convertToYards(gameType.maxDistanceMetres),
        otherDistancesYards: gameType.otherDistancesYards,
        otherDistancesMetres: gameType.otherDistancesMetres
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

function calculateDistanceLabel(config) {
  if (config.isImperial) {
    return `${config.maxDistanceYards}yd`;
  }
  return `${config.maxDistanceMetres}m`;
}

function sortByNumberOfEndsAndDistance(a, b) {
  return a.numberOfEnds - b.numberOfEnds || a.distanceValue - b.distanceValue;
}

export async function calculateAppropriateRounds(classification, age, sex, bowtype, maxYards) {
  const classificationNumber = classificationList.indexOf(classification);

  const improvementRounds = [];
  for (const round of gameTypes) {
    const scores = await calculateRoundScores(sex, bowtype, age, round);
    const config = gameTypeConfig[round];
    const distance = calculateDistanceLabel(config);
    const distanceValue = config.maxDistanceMetres || convertToMeters(config.maxDistanceYards);

    if (scores.length > (classificationNumber + 1) && config.maxDistanceYards <= maxYards) {
      const numberOfEnds = config.distancesRoundSizes.reduce((a, b) => a + b);
      improvementRounds.push({ round, numberOfEnds, distance, distanceValue });
    }
  }

  return improvementRounds.reduce((acc, round) => {
    if (round.numberOfEnds <= 4) {
      return { ...acc, short: [...acc.short, round].sort(sortByNumberOfEndsAndDistance) };
    } else if (round.numberOfEnds <= 8) {
      return { ...acc, medium: [...acc.medium, round].sort(sortByNumberOfEndsAndDistance) };
    } else {
      return { ...acc, long: [...acc.long, round].sort(sortByNumberOfEndsAndDistance) };
    }
  }, { short: [], medium: [], long: [] });
}
