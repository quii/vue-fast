import { MISS } from "@/domain/scores";

const imperialScores = [9, 7, 5, 3, 1, MISS];
const outdoorMetricScores = ["X", 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS];
const indoorMetricScores = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS];

const base = [
  {
    name: "national",
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 2]
  },
  {
    name: "warwick",
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [2, 2]
  },
  {
    name: "western",
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 4]
  },
  {
    name: "windsor",
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [3, 3, 3]
  },
  {
    name: "frostbite",
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3]
  },
  {
    name: "portsmouth",
    isOutdoor: false,
    isImperial: false,
    distancesRoundSizes: [5]
  },
  {
    name: "bray1",
    isOutdoor: false,
    isImperial: false,
    distancesRoundSizes: [3]
  }
];

export const gameTypeConfig = calculateConfigFromBase(base);
export const gameTypes = Object.keys(gameTypeConfig);

function calculateConfigFromBase(base) {
  return base.reduce((acc, gameType) => ({
    ...acc, [gameType.name]: {
      distancesRoundSizes: gameType.distancesRoundSizes,
      scores: calculateScoresForGame(gameType),
      unit: gameType.isImperial ? "yd" : "m",
      endSize: gameType.isOutdoor ? 6 : 3
    }
  }), {});
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



